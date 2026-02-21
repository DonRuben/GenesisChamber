"""FastAPI backend for LLM Council + Genesis Chamber."""

from fastapi import FastAPI, HTTPException, BackgroundTasks, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import json
import asyncio
import zipfile
from pathlib import Path

import io
import os
import re

import httpx

from . import storage
from .council import run_full_council, generate_conversation_title, stage1_collect_responses, stage2_collect_rankings, stage3_synthesize_final, calculate_aggregate_rankings
from .models import StartSimulationRequest, GateApprovalRequest, SimulationConfig, ParticipantConfig
from .simulation import GenesisSimulation
from .simulation_store import SimulationStore
from .config import (
    SIMULATION_PRESETS, DEFAULT_PARTICIPANTS, DEFAULT_MODERATOR,
    DEFAULT_EVALUATOR, DEFAULT_DEVILS_ADVOCATE, SOULS_DIR, PERSONA_COLORS,
    SIMULATION_OUTPUT_DIR, TEAMS, PERSONA_TEAMS, OPENROUTER_API_KEY, UPLOADS_DIR,
)
from .output_engine import OutputEngine
from .da_training import (
    extract_da_interactions, save_interactions_to_state, load_interactions_from_state,
    save_rating as da_save_rating, generate_training_report, generate_refinement_suggestions,
)
from .image_generator import ImageGenerator
from .video_generator import VideoGenerator, VIDEO_QUALITY_TIERS
from .prompt_bible import get_all_strategies, optimize_prompt as pb_optimize_prompt
from .database import DatabasePool, UploadDB, is_db_available, ensure_schema

app = FastAPI(title="LLM Council + Genesis Chamber API")
simulation_store = SimulationStore()
upload_db = UploadDB() if is_db_available() else None


@app.on_event("startup")
async def startup():
    if is_db_available():
        pool = await DatabasePool.get_pool()
        if pool:
            await ensure_schema()
            print("[startup] Database connected and schema ready")
        else:
            print("[startup] Database configured but connection failed — using file storage")
    else:
        print("[startup] No DATABASE_URL — using file-based storage only")


@app.on_event("shutdown")
async def shutdown():
    await DatabasePool.close()

# CORS — allow all origins so frontend can reach backend from any deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CreateConversationRequest(BaseModel):
    """Request to create a new conversation."""
    pass


class SendMessageRequest(BaseModel):
    """Request to send a message in a conversation."""
    content: str
    models: Optional[List[str]] = None
    chairman_model: Optional[str] = None
    thinking_mode: str = "off"  # "off", "thinking", or "deep"
    model_thinking_modes: Optional[Dict[str, str]] = None  # per-model overrides
    enable_web_search: bool = False


class RenameRequest(BaseModel):
    """Request to rename a conversation or simulation."""
    name: str


class ArchiveRequest(BaseModel):
    """Request to archive or unarchive a conversation or simulation."""
    archived: bool = True


class ConversationMetadata(BaseModel):
    """Conversation metadata for list view."""
    id: str
    created_at: str
    title: str
    message_count: int


class Conversation(BaseModel):
    """Full conversation with all messages."""
    id: str
    created_at: str
    title: str
    messages: List[Dict[str, Any]]


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "LLM Council API"}


@app.get("/api/conversations", response_model=List[ConversationMetadata])
async def list_conversations():
    """List all conversations (metadata only)."""
    return storage.list_conversations()


@app.post("/api/conversations", response_model=Conversation)
async def create_conversation(request: CreateConversationRequest):
    """Create a new conversation."""
    conversation_id = str(uuid.uuid4())
    conversation = storage.create_conversation(conversation_id)
    return conversation


@app.get("/api/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    """Get a specific conversation with all its messages."""
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@app.post("/api/conversations/{conversation_id}/message")
async def send_message(conversation_id: str, request: SendMessageRequest):
    """
    Send a message and run the 3-stage council process.
    Returns the complete response with all stages.
    """
    # Check if conversation exists
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Check if this is the first message
    is_first_message = len(conversation["messages"]) == 0

    # Add user message
    storage.add_user_message(conversation_id, request.content)

    # If this is the first message, generate a title
    if is_first_message:
        title = await generate_conversation_title(request.content)
        storage.update_conversation_title(conversation_id, title)

    # Run the 3-stage council process
    stage1_results, stage2_results, stage3_result, metadata = await run_full_council(
        request.content
    )

    # Add assistant message with all stages
    storage.add_assistant_message(
        conversation_id,
        stage1_results,
        stage2_results,
        stage3_result
    )

    # Return the complete response with metadata
    return {
        "stage1": stage1_results,
        "stage2": stage2_results,
        "stage3": stage3_result,
        "metadata": metadata
    }


@app.post("/api/conversations/{conversation_id}/message/stream")
async def send_message_stream(conversation_id: str, request: SendMessageRequest):
    """
    Send a message and stream the 3-stage council process.
    Returns Server-Sent Events as each stage completes.
    """
    # Check if conversation exists
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Check if this is the first message
    is_first_message = len(conversation["messages"]) == 0

    async def event_generator():
        try:
            # Add user message
            storage.add_user_message(conversation_id, request.content)

            # Start title generation in parallel (don't await yet)
            title_task = None
            if is_first_message:
                title_task = asyncio.create_task(generate_conversation_title(request.content))

            # Stage 1: Collect responses
            yield f"data: {json.dumps({'type': 'stage1_start'})}\n\n"
            stage1_results = await stage1_collect_responses(
                request.content, models=request.models,
                thinking_mode=request.thinking_mode,
                enable_web_search=request.enable_web_search,
                model_thinking_modes=request.model_thinking_modes)
            yield f"data: {json.dumps({'type': 'stage1_complete', 'data': stage1_results})}\n\n"

            # Stage 2: Collect rankings
            yield f"data: {json.dumps({'type': 'stage2_start'})}\n\n"
            stage2_results, label_to_model = await stage2_collect_rankings(
                request.content, stage1_results, models=request.models,
                thinking_mode=request.thinking_mode,
                enable_web_search=request.enable_web_search,
                model_thinking_modes=request.model_thinking_modes)
            aggregate_rankings = calculate_aggregate_rankings(stage2_results, label_to_model)
            yield f"data: {json.dumps({'type': 'stage2_complete', 'data': stage2_results, 'metadata': {'label_to_model': label_to_model, 'aggregate_rankings': aggregate_rankings}})}\n\n"

            # Stage 3: Synthesize final answer
            yield f"data: {json.dumps({'type': 'stage3_start'})}\n\n"
            stage3_result = await stage3_synthesize_final(
                request.content, stage1_results, stage2_results,
                chairman_model=request.chairman_model,
                thinking_mode=request.thinking_mode,
                enable_web_search=request.enable_web_search,
                model_thinking_modes=request.model_thinking_modes)
            yield f"data: {json.dumps({'type': 'stage3_complete', 'data': stage3_result})}\n\n"

            # Wait for title generation if it was started
            if title_task:
                title = await title_task
                storage.update_conversation_title(conversation_id, title)
                yield f"data: {json.dumps({'type': 'title_complete', 'data': {'title': title}})}\n\n"

            # Save complete assistant message
            storage.add_assistant_message(
                conversation_id,
                stage1_results,
                stage2_results,
                stage3_result
            )

            # Send completion event
            yield f"data: {json.dumps({'type': 'complete'})}\n\n"

        except Exception as e:
            # Send error event
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


# === CONVERSATION MANAGEMENT ===

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation."""
    deleted = storage.delete_conversation(conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "deleted", "id": conversation_id}


@app.patch("/api/conversations/{conversation_id}/rename")
async def rename_conversation(conversation_id: str, request: RenameRequest):
    """Rename a conversation."""
    try:
        storage.update_conversation_title(conversation_id, request.name)
    except ValueError:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "renamed", "id": conversation_id, "name": request.name}


@app.patch("/api/conversations/{conversation_id}/archive")
async def archive_conversation(conversation_id: str, request: ArchiveRequest):
    """Archive or unarchive a conversation."""
    try:
        storage.archive_conversation(conversation_id, request.archived)
    except ValueError:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "archived" if request.archived else "unarchived", "id": conversation_id}


# === GENESIS CHAMBER ENDPOINTS ===

# In-memory registry of running simulations
_running_simulations: Dict[str, GenesisSimulation] = {}


# Canonical name lookup from config — source of truth for known personas
import re
_CANONICAL_NAMES = {pid: p["name"] for pid, p in DEFAULT_PARTICIPANTS.items()}
_CANONICAL_NAMES[DEFAULT_MODERATOR["soul_document"].split("/")[-1].replace(".md", "")] = DEFAULT_MODERATOR["name"]
_CANONICAL_NAMES[DEFAULT_EVALUATOR["soul_document"].split("/")[-1].replace(".md", "")] = DEFAULT_EVALUATOR["name"]
_CANONICAL_NAMES[DEFAULT_DEVILS_ADVOCATE["soul_document"].split("/")[-1].replace(".md", "")] = DEFAULT_DEVILS_ADVOCATE["name"]


def clean_soul_name(raw_name: str, persona_id: str) -> str:
    """Extract a clean display name from a soul document heading."""
    # Try canonical lookup first (known personas)
    if persona_id in _CANONICAL_NAMES:
        return _CANONICAL_NAMES[persona_id]

    # Regex cleanup for custom/uploaded souls
    name = raw_name
    # Strip prefix: "SOUL DOCUMENT: "
    name = re.sub(r'^SOUL\s+DOCUMENT\s*[:]\s*', '', name, flags=re.IGNORECASE)
    # Strip suffixes: ": SOUL DOCUMENT", "— SOUL DOCUMENT", ": DEFINITIVE SOUL DOCUMENT", etc.
    name = re.sub(r'\s*[:\u2014\u2013—-]+\s*(?:COMPLETE\s+|DEFINITIVE\s+|GENESIS\s+CHAMBER\s+)?SOUL\s+DOCUMENT.*$', '', name, flags=re.IGNORECASE)
    # Title-case if ALL CAPS
    if name == name.upper() and len(name) > 1:
        name = name.title()
        # Fix "Van" → "van" for names like "Tobias van Schneider"
        name = re.sub(r'\bVan\b', 'van', name)
    return name.strip()


@app.get("/api/souls")
async def list_souls():
    """List available soul documents with team metadata."""
    souls_path = Path(SOULS_DIR)
    if not souls_path.exists():
        return []

    souls = []
    for f in sorted(souls_path.glob("*.md")):
        persona_id = f.stem
        # Read first few lines to get name
        with open(f, "r") as fh:
            first_lines = fh.read(500)
        # Extract name from heading
        name_match = re.search(r'^#\s+(.+)', first_lines, re.MULTILINE)
        raw_name = name_match.group(1).strip() if name_match else persona_id.replace("-", " ").title()
        name = clean_soul_name(raw_name, persona_id)

        # Team membership
        team_info = PERSONA_TEAMS.get(persona_id, {"team": "custom"})

        souls.append({
            "id": persona_id,
            "name": name,
            "file": str(f),
            "color": PERSONA_COLORS.get(persona_id, "#666666"),
            "team": team_info.get("team", "custom"),
            "cross_teams": team_info.get("cross_teams", []),
        })

    return souls


@app.get("/api/souls/{soul_id}/content")
async def get_soul_content(soul_id: str):
    """Get the raw markdown content of a soul document."""
    soul_path = Path(SOULS_DIR) / f"{soul_id}.md"
    if not soul_path.exists():
        raise HTTPException(status_code=404, detail="Soul not found")
    return {"id": soul_id, "content": soul_path.read_text(encoding="utf-8")}


@app.get("/api/souls/{soul_id}/download")
async def download_soul(soul_id: str):
    """Download a soul document as a markdown file."""
    from fastapi.responses import FileResponse
    soul_path = Path(SOULS_DIR) / f"{soul_id}.md"
    if not soul_path.exists():
        raise HTTPException(status_code=404, detail="Soul not found")
    return FileResponse(
        path=str(soul_path),
        media_type="text/markdown",
        filename=f"{soul_id}.md",
    )


@app.put("/api/souls/{soul_id}/content")
async def update_soul_content(soul_id: str, request: dict):
    """Update the markdown content of a soul document."""
    soul_path = Path(SOULS_DIR) / f"{soul_id}.md"
    if not soul_path.exists():
        raise HTTPException(status_code=404, detail="Soul not found")
    content = request.get("content", "")
    if not content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    soul_path.write_text(content, encoding="utf-8")
    return {"id": soul_id, "status": "updated"}


@app.get("/api/simulation/presets")
async def list_presets():
    """List available simulation presets."""
    return SIMULATION_PRESETS


@app.get("/api/simulations")
async def list_simulations():
    """List all simulations."""
    return await simulation_store.list_simulations_async()


@app.post("/api/simulation/start")
async def start_simulation(request: StartSimulationRequest, background_tasks: BackgroundTasks):
    """Start a new simulation. Returns sim_id immediately, runs in background."""
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured. Set it in your .env file.")

    config = request.config
    sim = GenesisSimulation(config)
    _running_simulations[sim.sim_id] = sim

    async def run_sim():
        try:
            await sim.run()
        except Exception as e:
            import traceback
            sim.state.status = "failed"
            sim.state.event_log.append({
                "type": "error",
                "message": str(e),
                "traceback": traceback.format_exc(),
            })
            simulation_store.save_state(sim.state)
        finally:
            _running_simulations.pop(sim.sim_id, None)

    asyncio.create_task(run_sim())

    return {"sim_id": sim.sim_id, "status": "started"}


@app.post("/api/simulation/start/stream")
async def start_simulation_stream(request: StartSimulationRequest):
    """Start a new simulation with SSE streaming."""
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured. Set it in your .env file.")

    config = request.config
    sim = GenesisSimulation(config)
    _running_simulations[sim.sim_id] = sim

    async def event_generator():
        event_queue: asyncio.Queue = asyncio.Queue()

        async def on_stage(round_num, stage_num, stage_name, result):
            await event_queue.put({
                "type": f"stage_{stage_num}_complete",
                "round": round_num,
                "stage": stage_num,
                "stage_name": stage_name,
                "status": result.status,
            })

        async def on_round(round_num, round_result):
            await event_queue.put({
                "type": "round_complete",
                "round": round_num,
                "mode": round_result.mode,
                "concepts_surviving": round_result.concepts_surviving,
                "concepts_eliminated": round_result.concepts_eliminated,
            })

        async def on_gate(round_num, gate):
            await event_queue.put({
                "type": "quality_gate",
                "round": round_num,
                "gate": gate,
            })

        async def on_stage_start(round_num, stage_num, stage_name, participants):
            await event_queue.put({
                "type": "stage_start",
                "round": round_num,
                "stage": stage_num,
                "stage_name": stage_name,
                "participants": participants,
            })

        async def on_participant_event(round_num, event_type, pid, display_name, stage_name, extra=None):
            await event_queue.put({
                "type": f"participant_{event_type}",
                "round": round_num,
                "persona_id": pid,
                "persona_name": display_name,
                "stage_name": stage_name,
                "extra": extra,
            })

        async def run_and_signal():
            try:
                yield_data = {"type": "simulation_started", "sim_id": sim.sim_id}
                await event_queue.put(yield_data)

                await sim.run(
                    on_stage_complete=on_stage,
                    on_round_complete=on_round,
                    on_gate_reached=on_gate,
                    on_stage_start=on_stage_start,
                    on_participant_event=on_participant_event,
                )

                await event_queue.put({
                    "type": "simulation_complete",
                    "sim_id": sim.sim_id,
                })
            except Exception as e:
                await event_queue.put({
                    "type": "error",
                    "message": str(e),
                })
            finally:
                await event_queue.put(None)  # Sentinel
                _running_simulations.pop(sim.sim_id, None)

        # Start simulation in background
        sim_task = asyncio.create_task(run_and_signal())

        try:
            while True:
                event = await event_queue.get()
                if event is None:
                    break
                yield f"data: {json.dumps(event, default=str)}\n\n"
        finally:
            if not sim_task.done():
                sim_task.cancel()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@app.get("/api/simulation/{sim_id}/status")
async def get_simulation_status(sim_id: str):
    """Get current simulation status."""
    # Check running simulations first
    if sim_id in _running_simulations:
        sim = _running_simulations[sim_id]
        error_msg = next((e.get("message") for e in sim.state.event_log if e.get("type") == "error"), None)
        return {
            "id": sim_id,
            "status": sim.state.status,
            "current_round": sim.state.current_round,
            "current_stage": sim.state.current_stage,
            "current_stage_name": sim.state.current_stage_name,
            "total_rounds": sim.config.rounds,
            "error": error_msg,
        }

    # Check stored state
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")

    error_msg = next((e.get("message") for e in state.event_log if e.get("type") == "error"), None)
    return {
        "id": sim_id,
        "status": state.status,
        "current_round": state.current_round,
        "current_stage": state.current_stage,
        "current_stage_name": state.current_stage_name,
        "total_rounds": state.config.rounds,
        "error": error_msg,
    }


@app.get("/api/simulation/{sim_id}/round/{round_num}")
async def get_round_results(sim_id: str, round_num: int):
    """Get results for a specific round."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")

    for r in state.rounds:
        if r.round_num == round_num:
            return r.model_dump(mode="json")

    raise HTTPException(status_code=404, detail=f"Round {round_num} not found")


@app.get("/api/simulation/{sim_id}/state")
async def get_simulation_state(sim_id: str):
    """Get full simulation state."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return state.model_dump(mode="json")


@app.post("/api/simulation/{sim_id}/gate/{round_num}/approve")
async def approve_gate(sim_id: str, round_num: int, request: GateApprovalRequest):
    """Approve or redirect a quality gate."""
    state = simulation_store.save_quality_gate(
        sim_id, round_num, request.decision, request.notes
    )
    return {"status": "ok", "simulation_status": state.status}


@app.get("/api/simulation/{sim_id}/transcript")
async def get_transcript(sim_id: str):
    """Get full simulation transcript."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return {
        "entries": state.transcript_entries,
        "event_log": state.event_log,
    }


# === SIMULATION MANAGEMENT ===

@app.delete("/api/simulation/{sim_id}")
async def delete_simulation(sim_id: str):
    """Delete a simulation. Cannot delete while running."""
    if sim_id in _running_simulations:
        raise HTTPException(status_code=409, detail="Cannot delete a running simulation")
    deleted = simulation_store.delete_simulation(sim_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return {"status": "deleted", "id": sim_id}


@app.patch("/api/simulation/{sim_id}/rename")
async def rename_simulation(sim_id: str, request: RenameRequest):
    """Rename a simulation."""
    try:
        simulation_store.rename_simulation(sim_id, request.name)
    except ValueError:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return {"status": "renamed", "id": sim_id, "name": request.name}


@app.patch("/api/simulation/{sim_id}/archive")
async def archive_simulation(sim_id: str, request: ArchiveRequest):
    """Archive or unarchive a simulation."""
    try:
        simulation_store.archive_simulation(sim_id, request.archived)
    except ValueError:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return {"status": "archived" if request.archived else "unarchived", "id": sim_id}


@app.post("/api/simulation/quick-start")
async def quick_start_simulation(
    preset: str = "quick_test",
    brief: Optional[str] = None,
    participants: Optional[List[str]] = None,
):
    """Quick-start a simulation with defaults. Minimal configuration needed."""
    preset_config = SIMULATION_PRESETS.get(preset)
    if not preset_config:
        raise HTTPException(status_code=400, detail=f"Unknown preset: {preset}")

    # Load default brief if none provided
    if not brief:
        brief_path = Path("briefs/example-brief.md")
        if brief_path.exists():
            brief = brief_path.read_text(encoding="utf-8")
        else:
            brief = "Create a compelling brand concept."

    # Select participants
    selected = participants or list(DEFAULT_PARTICIPANTS.keys())[:3]
    participant_configs = {}
    for pid in selected:
        if pid in DEFAULT_PARTICIPANTS:
            p = DEFAULT_PARTICIPANTS[pid]
            participant_configs[pid] = ParticipantConfig(
                display_name=p["name"],
                model=p["model"],
                soul_document=p["soul_document"],
                role=p["role"],
                temperature=p["temperature"],
                max_tokens=p["max_tokens"],
                color=p["color"],
            )

    moderator = ParticipantConfig(
        display_name=DEFAULT_MODERATOR["name"],
        model=DEFAULT_MODERATOR["model"],
        soul_document=DEFAULT_MODERATOR["soul_document"],
        role="moderator",
        temperature=DEFAULT_MODERATOR["temperature"],
        max_tokens=DEFAULT_MODERATOR["max_tokens"],
        color=DEFAULT_MODERATOR["color"],
    )

    config = SimulationConfig(
        name=preset_config["name"],
        type=preset_config["type"],
        rounds=preset_config["rounds"],
        stages_per_round=preset_config["stages_per_round"],
        concepts_round_1=preset_config["concepts_round_1"],
        concepts_round_2_plus=preset_config["concepts_round_2_plus"],
        participants=participant_configs,
        moderator=moderator,
        elimination_schedule=preset_config["elimination_schedule"],
        quality_gates=preset_config["quality_gates"],
        brief=brief,
    )

    sim = GenesisSimulation(config)
    _running_simulations[sim.sim_id] = sim

    # Run in background
    async def run_sim():
        try:
            await sim.run()
        except Exception as e:
            sim.state.status = "failed"
            sim.state.event_log.append({"type": "error", "message": str(e)})
            simulation_store.save_state(sim.state)
        finally:
            _running_simulations.pop(sim.sim_id, None)

    asyncio.create_task(run_sim())

    return {
        "sim_id": sim.sim_id,
        "status": "started",
        "preset": preset,
        "participants": list(participant_configs.keys()),
        "rounds": config.rounds,
    }


# === CONFIG ENDPOINTS ===


@app.get("/api/config/models")
async def get_available_models():
    """Return available models grouped by tier."""
    import json
    roster_path = Path("genesis-chamber-builder/config/model-roster.json")
    if roster_path.exists():
        with open(roster_path) as f:
            return json.load(f)
    # Fallback minimal roster
    return {
        "recommended_models": {
            "tier_1_premium": {
                "description": "Best quality, highest cost",
                "models": [
                    {"id": "anthropic/claude-opus-4-6", "cost_per_1m_tokens": 15.0, "context": "200K", "best_for": "Deepest reasoning, synthesis"},
                    {"id": "openai/gpt-5.2", "cost_per_1m_tokens": 15.0, "context": "128K", "best_for": "Creative reasoning"},
                    {"id": "openai/gpt-5.1", "cost_per_1m_tokens": 5.0, "context": "128K", "best_for": "Strong creative reasoning"},
                    {"id": "google/gemini-3-pro", "cost_per_1m_tokens": 7.0, "context": "2M", "best_for": "Long context"}
                ]
            },
            "tier_2_balanced": {
                "description": "Great quality, reasonable cost",
                "models": [
                    {"id": "anthropic/claude-sonnet-4.6", "cost_per_1m_tokens": 3.0, "context": "1M", "best_for": "Detail, precision"},
                    {"id": "google/gemini-2.5-pro", "cost_per_1m_tokens": 2.5, "context": "1M", "best_for": "Research-heavy"},
                    {"id": "x-ai/grok-4", "cost_per_1m_tokens": 3.0, "context": "128K", "best_for": "Bold, provocative"},
                    {"id": "x-ai/grok-4.1", "cost_per_1m_tokens": 3.0, "context": "128K", "best_for": "Latest Grok, improved reasoning"},
                    {"id": "mistralai/mistral-large", "cost_per_1m_tokens": 2.0, "context": "128K", "best_for": "EU alternative, strong reasoning"}
                ]
            },
            "tier_3_efficient": {
                "description": "Good quality, low cost",
                "models": [
                    {"id": "meta-llama/llama-4-maverick", "cost_per_1m_tokens": 0.5, "context": "128K", "best_for": "Direct, efficient"},
                    {"id": "anthropic/claude-haiku-4.5", "cost_per_1m_tokens": 0.25, "context": "200K", "best_for": "Quick, testing"},
                    {"id": "google/gemini-2.5-flash", "cost_per_1m_tokens": 0.15, "context": "1M", "best_for": "Bulk operations"},
                    {"id": "deepseek/deepseek-v3.2", "cost_per_1m_tokens": 0.28, "context": "128K", "best_for": "Frontier-killer value"},
                    {"id": "deepseek/deepseek-r1", "cost_per_1m_tokens": 0.55, "context": "128K", "best_for": "Reasoning chain"},
                    {"id": "google/gemini-3-flash", "cost_per_1m_tokens": 0.10, "context": "1M", "best_for": "Ultra fast, huge context"},
                    {"id": "qwen/qwen-3-235b", "cost_per_1m_tokens": 0.30, "context": "128K", "best_for": "Strong open source"}
                ]
            },
            "tier_4_budget": {
                "description": "Experimental, ultra-low cost",
                "models": [
                    {"id": "moonshot/kimi-k2.5", "cost_per_1m_tokens": 0.10, "context": "128K", "best_for": "Ultra budget"},
                    {"id": "minimax/minimax-m2.5", "cost_per_1m_tokens": 0.15, "context": "128K", "best_for": "Budget alternative"},
                    {"id": "nvidia/llama-3.3-nemotron", "cost_per_1m_tokens": 0.0, "context": "128K", "best_for": "Free tier, testing"}
                ]
            }
        }
    }


@app.get("/api/config/participants")
async def get_default_participants():
    """Return default participant, moderator, evaluator, and Devil's Advocate configurations."""
    from .config import DEFAULT_PARTICIPANTS, DEFAULT_MODERATOR, DEFAULT_EVALUATOR, DEFAULT_DEVILS_ADVOCATE, TEAMS, PERSONA_TEAMS
    return {
        "participants": DEFAULT_PARTICIPANTS,
        "moderator": DEFAULT_MODERATOR,
        "evaluator": DEFAULT_EVALUATOR,
        "devils_advocate": DEFAULT_DEVILS_ADVOCATE,
        "teams": TEAMS,
        "persona_teams": PERSONA_TEAMS,
    }


@app.get("/api/config/teams")
async def get_teams():
    """Return team definitions and membership."""
    return {
        "teams": TEAMS,
        "persona_teams": PERSONA_TEAMS,
    }


@app.post("/api/souls/upload")
async def upload_soul_file(
    file: UploadFile = File(...),
    team: str = Form("custom"),
    color: str = Form("#666666"),
):
    """Upload a new soul document (.md file). The system extracts the persona name and registers it."""
    # Validate file type
    if not file.filename.endswith(".md"):
        raise HTTPException(status_code=400, detail="Only .md files are supported")

    # Read contents
    content = await file.read()
    text = content.decode("utf-8")

    # Derive persona ID from filename
    persona_id = file.filename.replace(".md", "").lower().replace(" ", "-")

    # Extract and clean name from soul document header
    name_match = re.search(r'^#\s+(.+)', text, re.MULTILINE)
    raw_name = name_match.group(1).strip() if name_match else persona_id.replace("-", " ").title()
    name = clean_soul_name(raw_name, persona_id)

    # Save to souls directory
    souls_path = Path(SOULS_DIR)
    souls_path.mkdir(parents=True, exist_ok=True)
    dest = souls_path / f"{persona_id}.md"
    dest.write_text(text, encoding="utf-8")

    # Register in runtime config
    PERSONA_COLORS[persona_id] = color
    PERSONA_TEAMS[persona_id] = {"team": team}

    return {
        "id": persona_id,
        "name": name,
        "file": str(dest),
        "color": color,
        "team": team,
        "cross_teams": [],
        "status": "uploaded",
    }


# === MARKDOWN EXPORT ENDPOINTS ===


@app.get("/api/simulation/{sim_id}/export/summary")
async def export_summary_markdown(sim_id: str):
    """Export full simulation summary as markdown."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")
    engine = OutputEngine()
    md = engine.generate_markdown_summary(state)
    return StreamingResponse(
        io.BytesIO(md.encode("utf-8")),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{sim_id}-summary.md"'},
    )


@app.get("/api/simulation/{sim_id}/export/winner")
async def export_winner_markdown(sim_id: str):
    """Export winner concept package as markdown."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")
    engine = OutputEngine()
    md = engine.generate_markdown_winner(state)
    return StreamingResponse(
        io.BytesIO(md.encode("utf-8")),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{sim_id}-winner.md"'},
    )


@app.get("/api/simulation/{sim_id}/export/round/{round_num}")
async def export_round_markdown(sim_id: str, round_num: int):
    """Export one round as markdown."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")
    engine = OutputEngine()
    md = engine.generate_markdown_round(state, round_num)
    return StreamingResponse(
        io.BytesIO(md.encode("utf-8")),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{sim_id}-round-{round_num}.md"'},
    )


@app.get("/api/simulation/{sim_id}/export/persona/{persona_id}")
async def export_persona_markdown(sim_id: str, persona_id: str):
    """Export one persona's contributions as markdown."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")
    engine = OutputEngine()
    md = engine.generate_markdown_persona(state, persona_id)
    return StreamingResponse(
        io.BytesIO(md.encode("utf-8")),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{sim_id}-{persona_id}.md"'},
    )


@app.get("/api/simulation/{sim_id}/export/devils-advocate")
async def export_da_markdown(sim_id: str):
    """Export Devil's Advocate challenge report as markdown."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")
    engine = OutputEngine()
    md = engine.generate_markdown_devils_advocate(state)
    return StreamingResponse(
        io.BytesIO(md.encode("utf-8")),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="da-report-{sim_id}.md"'},
    )


@app.get("/api/simulation/{sim_id}/export/production")
async def export_production_markdown(sim_id: str):
    """Export production-ready winner package as markdown."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")
    engine = OutputEngine()
    md = engine.generate_production_package(state)
    return StreamingResponse(
        io.BytesIO(md.encode("utf-8")),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="production-{sim_id}.md"'},
    )


# === DA TRAINING / ARENA ENDPOINTS ===


class DARatingRequest(BaseModel):
    interaction_id: str
    rating: str  # "brilliant", "effective", "weak", "unfair"
    notes: str = ""


@app.post("/api/simulation/{sim_id}/da/extract")
async def extract_da(sim_id: str):
    """Extract DA interactions from a completed simulation for review."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")
    interactions = extract_da_interactions(state)
    save_interactions_to_state(state, interactions)
    await simulation_store.save_state_async(state)
    return {"count": len(interactions), "interactions": [i.dict() for i in interactions]}


@app.get("/api/simulation/{sim_id}/da/interactions")
async def get_da_interactions(sim_id: str):
    """Get all DA interactions for review."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")
    interactions = load_interactions_from_state(state)
    return {"interactions": [i.dict() for i in interactions]}


@app.post("/api/simulation/{sim_id}/da/rate")
async def rate_da_interaction(sim_id: str, req: DARatingRequest):
    """Rate a DA interaction: brilliant, effective, weak, unfair."""
    valid_ratings = ("brilliant", "effective", "weak", "unfair")
    if req.rating not in valid_ratings:
        raise HTTPException(
            status_code=400,
            detail=f"Rating must be one of: {', '.join(valid_ratings)}"
        )
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")

    found = da_save_rating(state, req.interaction_id, req.rating, req.notes)
    if not found:
        raise HTTPException(status_code=404, detail="Interaction not found")

    await simulation_store.save_state_async(state)
    return {"status": "saved", "interaction_id": req.interaction_id, "rating": req.rating}


@app.get("/api/simulation/{sim_id}/da/training")
async def get_training_data(sim_id: str):
    """Get aggregated training data from reviewed DA interactions."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")
    report = generate_training_report(state)
    return report


@app.get("/api/simulation/{sim_id}/da/suggestions")
async def get_da_suggestions(sim_id: str):
    """Get soul refinement suggestions based on reviewed DA interactions."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")
    suggestions = generate_refinement_suggestions(state)
    return {"suggestions": suggestions}


# === OUTPUT & MEDIA ENDPOINTS ===


@app.get("/api/simulation/{sim_id}/presentation")
async def get_presentation(sim_id: str):
    """Generate and serve a reveal.js presentation."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")

    engine = OutputEngine()
    path = engine.generate_reveal_presentation(state)

    return FileResponse(
        path=str(path),
        media_type="text/html",
        filename=f"{sim_id}-presentation.html",
    )


@app.get("/api/simulation/{sim_id}/output/{filename}")
async def get_output_file(sim_id: str, filename: str):
    """Serve a generated output file (transcript, summary, etc.)."""
    if ".." in filename or "/" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    path = Path(SIMULATION_OUTPUT_DIR) / sim_id / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    media_types = {
        ".html": "text/html",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
    }
    media_type = media_types.get(path.suffix, "application/octet-stream")

    return FileResponse(path=str(path), media_type=media_type)


class GenerateImagesRequest(BaseModel):
    model: Optional[str] = None  # Override auto-selection with specific model key
    scope: Optional[str] = "active"  # V3: 'winner', 'active', 'all'


@app.post("/api/simulation/{sim_id}/generate-images")
async def generate_images(sim_id: str, request: Optional[GenerateImagesRequest] = None):
    """Generate images for all concept image prompts via fal.ai."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")

    engine = OutputEngine()
    sim_dir = Path(SIMULATION_OUTPUT_DIR) / sim_id
    sim_dir.mkdir(parents=True, exist_ok=True)
    scope = request.scope if request and request.scope else "active"
    prompts_path = engine.generate_image_prompts(state, sim_dir, scope=scope)

    with open(prompts_path) as f:
        prompts = json.load(f)

    if not prompts:
        return {"status": "no_prompts", "count": 0}

    generator = ImageGenerator()
    model_override = request.model if request else None

    async def run_generation():
        await generator.generate_batch(prompts, sim_id, model_override=model_override)

    asyncio.create_task(run_generation())

    return {"status": "generating", "count": len(prompts), "model": model_override or "auto"}


@app.get("/api/simulation/{sim_id}/images")
async def get_generated_images(sim_id: str):
    """Get generated image results."""
    results_path = Path(SIMULATION_OUTPUT_DIR) / sim_id / "generated_images.json"
    if not results_path.exists():
        return {"images": [], "status": "not_generated"}

    with open(results_path) as f:
        images = json.load(f)

    return {"images": images, "status": "complete"}


class GenerateVideosRequest(BaseModel):
    quality: str = "standard"  # hero, standard, draft


@app.get("/api/simulation/{sim_id}/video-tiers")
async def get_video_tiers():
    """Get available video quality tiers and cost estimates."""
    return VIDEO_QUALITY_TIERS


@app.post("/api/simulation/{sim_id}/generate-videos")
async def generate_videos(sim_id: str, request: GenerateVideosRequest):
    """Generate videos for winner/finalist concepts via fal.ai.

    Optional post-processing step — only for winners/finalists.
    """
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")

    if request.quality not in VIDEO_QUALITY_TIERS:
        raise HTTPException(status_code=400, detail=f"Unknown quality tier: {request.quality}")

    # Collect video prompts from winner/finalist concepts only
    active_concepts = state.concepts.get("active", [])
    winner_concepts = [c for c in active_concepts if c.status in ("winner", "finalist", "active")]

    if not winner_concepts:
        return {"status": "no_concepts", "count": 0}

    prompts = []
    # Check if we have generated images to use as source (image-to-video is better)
    images_path = Path(SIMULATION_OUTPUT_DIR) / sim_id / "generated_images.json"
    image_map = {}
    if images_path.exists():
        with open(images_path) as f:
            for img in json.load(f):
                image_map[img.get("concept_name", "")] = img.get("url")

    for concept in winner_concepts:
        video_prompt = concept.video_prompt or concept.image_prompt or concept.idea or ""
        if not video_prompt:
            continue

        prompt_data = {
            "concept_name": concept.name,
            "prompt": video_prompt,
            "persona": concept.persona_name,
            "status": concept.status,
        }
        # Attach image URL if available (enables image-to-video)
        if concept.name in image_map:
            prompt_data["image_url"] = image_map[concept.name]

        prompts.append(prompt_data)

    if not prompts:
        return {"status": "no_prompts", "count": 0}

    generator = VideoGenerator()

    async def run_generation():
        await generator.generate_for_concepts(prompts, sim_id, request.quality)

    asyncio.create_task(run_generation())

    return {
        "status": "generating",
        "count": len(prompts),
        "quality": request.quality,
        "cost_estimate": VIDEO_QUALITY_TIERS[request.quality]["cost_estimate"],
    }


@app.get("/api/simulation/{sim_id}/videos")
async def get_generated_videos(sim_id: str):
    """Get generated video results."""
    results_path = Path(SIMULATION_OUTPUT_DIR) / sim_id / "generated_videos.json"
    if not results_path.exists():
        return {"videos": [], "status": "not_generated"}

    with open(results_path) as f:
        videos = json.load(f)

    return {"videos": videos, "status": "complete"}


@app.get("/api/simulation/{sim_id}/generated")
async def get_all_generated(sim_id: str):
    """Get all generated content (images + videos) combined."""
    sim_dir = Path(SIMULATION_OUTPUT_DIR) / sim_id

    images = []
    images_path = sim_dir / "generated_images.json"
    if images_path.exists():
        with open(images_path) as f:
            images = json.load(f)

    videos = []
    videos_path = sim_dir / "generated_videos.json"
    if videos_path.exists():
        with open(videos_path) as f:
            videos = json.load(f)

    return {
        "images": images,
        "videos": videos,
        "has_content": len(images) > 0 or len(videos) > 0,
    }


@app.get("/api/simulation/{sim_id}/media/{media_type}/{filename}")
async def serve_media(sim_id: str, media_type: str, filename: str):
    """Serve locally persisted media files (images/videos)."""
    if media_type not in ("images", "videos"):
        raise HTTPException(status_code=400, detail="Invalid media type")
    # Prevent path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    filepath = Path(SIMULATION_OUTPUT_DIR) / sim_id / "media" / media_type / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Media file not found")
    content_type = "image/png" if media_type == "images" else "video/mp4"
    return FileResponse(filepath, media_type=content_type)


@app.post("/api/simulation/{sim_id}/persist-media")
async def persist_media(sim_id: str):
    """Download and persist any fal.ai media that hasn't been saved locally yet."""
    sim_dir = Path(SIMULATION_OUTPUT_DIR) / sim_id
    if not sim_dir.exists():
        raise HTTPException(status_code=404, detail="Simulation not found")

    results = {"images_saved": 0, "videos_saved": 0, "errors": []}

    for media_file, media_type in [
        ("generated_images.json", "images"),
        ("generated_videos.json", "videos"),
    ]:
        json_path = sim_dir / media_file
        if not json_path.exists():
            continue
        items = json.loads(json_path.read_text())
        media_dir = sim_dir / "media" / media_type
        media_dir.mkdir(parents=True, exist_ok=True)

        for item in items:
            if item.get("local_path") and (sim_dir.parent / item["local_path"]).exists():
                continue  # Already persisted
            if not item.get("url"):
                continue

            try:
                safe_name = re.sub(r'[^a-z0-9_-]', '_', item.get("concept_name", "unknown").lower())[:50]
                ext = "png" if media_type == "images" else "mp4"
                filename = f"{safe_name}_{item.get('model', 'unknown')}.{ext}"
                filepath = media_dir / filename

                async with httpx.AsyncClient(timeout=120.0) as client:
                    response = await client.get(item["url"])
                    response.raise_for_status()
                    filepath.write_bytes(response.content)

                item["local_path"] = f"{sim_id}/media/{media_type}/{filename}"
                item["filename"] = filename
                item["file_size"] = len(response.content)
                results[f"{media_type}_saved"] += 1
            except Exception as e:
                results["errors"].append(f"{item.get('concept_name')}: {str(e)}")

        # Re-save the updated JSON with local paths
        json_path.write_text(json.dumps(items, indent=2), encoding="utf-8")

    return results


# === PROMPT BIBLE API ===

@app.get("/api/prompt-bible/strategies")
async def get_prompt_strategies():
    """Return all model prompt strategies for UI display."""
    return get_all_strategies()


@app.post("/api/prompt-bible/optimize")
async def optimize_concept_prompt(request: dict):
    """Preview prompt optimization for a concept."""
    concept = request.get("concept", {})
    model_key = request.get("model_key", "nano_banana_pro")
    optimized = pb_optimize_prompt(concept, model_key)
    return {"original": concept.get("prompt", ""), "optimized": optimized, "model": model_key}


@app.get("/api/simulation/{sim_id}/download/all")
async def download_all_generated(sim_id: str):
    """Download all generated content as a ZIP file.

    Fetches images/videos from fal.ai URLs and packages them into a ZIP.
    Note: fal.ai URLs are temporary (~24h), so this is best-effort.
    """
    sim_dir = Path(SIMULATION_OUTPUT_DIR) / sim_id

    images = []
    images_path = sim_dir / "generated_images.json"
    if images_path.exists():
        with open(images_path) as f:
            images = json.load(f)

    videos = []
    videos_path = sim_dir / "generated_videos.json"
    if videos_path.exists():
        with open(videos_path) as f:
            videos = json.load(f)

    if not images and not videos:
        raise HTTPException(status_code=404, detail="No generated content to download")

    def safe_filename(name: str, ext: str) -> str:
        """Make a safe filename from concept name."""
        safe = re.sub(r'[^\w\s-]', '', name).strip().replace(' ', '_')[:50]
        return f"{safe}{ext}" if safe else f"unnamed{ext}"

    zip_buffer = io.BytesIO()
    async with httpx.AsyncClient(timeout=60.0) as client:
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            for i, img in enumerate(images):
                url = img.get("url")
                name = img.get("concept_name", f"image_{i+1}")
                if url:
                    try:
                        resp = await client.get(url)
                        if resp.status_code == 200:
                            fname = safe_filename(name, ".png")
                            # Avoid duplicate filenames
                            if fname in [info.filename for info in zf.filelist]:
                                fname = f"{i+1}_{fname}"
                            zf.writestr(f"images/{fname}", resp.content)
                    except Exception as e:
                        print(f"Failed to download image {name}: {e}")

            for i, vid in enumerate(videos):
                url = vid.get("url")
                name = vid.get("concept_name", f"video_{i+1}")
                if url:
                    try:
                        resp = await client.get(url)
                        if resp.status_code == 200:
                            fname = safe_filename(name, ".mp4")
                            if fname in [info.filename for info in zf.filelist]:
                                fname = f"{i+1}_{fname}"
                            zf.writestr(f"videos/{fname}", resp.content)
                    except Exception as e:
                        print(f"Failed to download video {name}: {e}")

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=genesis-chamber-{sim_id[:8]}-generated.zip"},
    )


# === REFERENCE FILE UPLOAD ENDPOINTS ===

MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50MB

# Safe file extensions for ZIP extraction
SAFE_EXTENSIONS = {
    '.html', '.htm', '.css', '.js', '.json', '.png', '.jpg', '.jpeg',
    '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.map',
    '.txt', '.md', '.xml', '.webp', '.avif', '.pdf',
}

# Categorized upload types
_TEXT_EXTS = {"html", "htm", "txt", "md", "css", "js", "json", "xml"}
_IMAGE_EXTS = {"png", "jpg", "jpeg", "gif", "svg", "webp", "avif"}
_PDF_EXTS = {"pdf"}
_ARCHIVE_EXTS = {"zip"}
_ALLOWED_UPLOAD_EXTS = _TEXT_EXTS | _IMAGE_EXTS | _PDF_EXTS | _ARCHIVE_EXTS

# Content-type map (used for DB save + serving)
_CONTENT_TYPES = {
    ".html": "text/html", ".htm": "text/html", ".css": "text/css",
    ".js": "application/javascript", ".json": "application/json",
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp",
    ".avif": "image/avif", ".ico": "image/x-icon",
    ".txt": "text/plain", ".md": "text/plain", ".xml": "text/xml",
    ".pdf": "application/pdf",
    ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
}


def _extract_text_from_html(html: str) -> str:
    """Strip HTML tags and extract readable text content for LLM context."""
    import re as _re
    text = _re.sub(r'<(script|style)[^>]*>.*?</\1>', '', html, flags=_re.DOTALL | _re.IGNORECASE)
    text = _re.sub(r'<[^>]+>', ' ', text)
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&nbsp;', ' ')
    text = text.replace('&#39;', "'").replace('&quot;', '"')
    text = _re.sub(r'\s+', ' ', text).strip()
    if len(text) > 15000:
        text = text[:15000] + "\n\n[...content truncated for context window...]"
    return text


def _extract_text_from_plaintext(raw: bytes, filename: str = "") -> str:
    """Extract text from plain text files (.txt, .md, .css, .js, .json, etc.)."""
    text = raw.decode("utf-8", errors="replace").strip()
    if len(text) > 15000:
        text = text[:15000] + "\n\n[...content truncated for context window...]"
    return f"[File: {filename}]\n{text}" if filename else text


def _describe_image_file(filename: str, raw: bytes = None) -> str:
    """Return a text note indicating an image reference was provided, with dimensions if possible."""
    dims = ""
    if raw:
        try:
            import struct
            if filename.lower().endswith('.png') and raw[:8] == b'\x89PNG\r\n\x1a\n':
                w, h = struct.unpack('>II', raw[16:24])
                dims = f" ({w}x{h}px)"
            elif filename.lower().endswith(('.jpg', '.jpeg')) and raw[:2] == b'\xff\xd8':
                # Parse JPEG SOF0 marker for dimensions
                i = 2
                while i < len(raw) - 9:
                    if raw[i] == 0xFF and raw[i+1] in (0xC0, 0xC2):
                        h, w = struct.unpack('>HH', raw[i+5:i+9])
                        dims = f" ({w}x{h}px)"
                        break
                    if raw[i] == 0xFF and raw[i+1] not in (0x00, 0xFF):
                        seg_len = struct.unpack('>H', raw[i+2:i+4])[0]
                        i += 2 + seg_len
                    else:
                        i += 1
        except Exception:
            pass
    return f"[Reference image provided: {filename}{dims} — visual reference available in uploaded files]"


def _extract_text_from_pdf_basic(raw: bytes, filename: str) -> str:
    """PDF text extraction using pdfplumber (primary), pypdf (fallback), then regex."""
    import io as _io

    # Try pdfplumber first (most robust — handles complex layouts, fonts, encoding)
    try:
        import pdfplumber
        pages_text = []
        with pdfplumber.open(_io.BytesIO(raw)) as pdf:
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    pages_text.append(f"[Page {i+1}]\n{page_text.strip()}")
        if pages_text:
            text = "\n\n".join(pages_text)
            if len(text) > 15000:
                text = text[:15000] + "\n\n[...content truncated for context window...]"
            return f"[PDF: {filename}]\n{text}"
    except ImportError:
        pass
    except Exception as e:
        print(f"[upload] pdfplumber extraction failed for {filename}: {e}")

    # Fallback: pypdf (lighter but handles fewer PDF types)
    try:
        from pypdf import PdfReader
        reader = PdfReader(_io.BytesIO(raw))
        pages_text = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                pages_text.append(f"[Page {i+1}]\n{page_text.strip()}")
        if pages_text:
            text = "\n\n".join(pages_text)
            if len(text) > 15000:
                text = text[:15000] + "\n\n[...content truncated for context window...]"
            return f"[PDF: {filename}]\n{text}"
    except ImportError:
        pass
    except Exception as e:
        print(f"[upload] pypdf extraction failed for {filename}: {e}")

    # Fallback: regex extraction from raw PDF bytes
    import re as _re
    text_parts = []
    for match in _re.finditer(rb'\(([^)]{1,500})\)\s*Tj', raw):
        try:
            text_parts.append(match.group(1).decode('latin-1', errors='replace'))
        except Exception:
            pass
    if text_parts:
        text = ' '.join(text_parts).strip()
        if len(text) > 15000:
            text = text[:15000] + "\n\n[...content truncated for context window...]"
        return f"[PDF: {filename}]\n{text}"
    return f"[PDF reference provided: {filename} — uploaded but text could not be extracted from this PDF]"


def _extract_member_text(member_path: Path, member_bytes: bytes, member_name: str) -> str:
    """Extract text from a single file (for ZIP members or direct uploads)."""
    suffix = member_path.suffix.lower()
    if suffix in ('.html', '.htm'):
        return _extract_text_from_html(member_bytes.decode("utf-8", errors="replace"))
    elif suffix in ('.txt', '.md', '.css', '.js', '.json', '.xml'):
        return _extract_text_from_plaintext(member_bytes, member_name)
    elif suffix in ('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'):
        return _describe_image_file(member_name, member_bytes)
    elif suffix == '.pdf':
        return _extract_text_from_pdf_basic(member_bytes, member_name)
    return ""


@app.post("/api/upload/reference")
async def upload_reference_file(file: UploadFile = File(...)):
    """Upload a reference file (image, HTML, text, PDF, or ZIP) for LLM context."""
    filename = file.filename or ""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    if ext not in _ALLOWED_UPLOAD_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Accepted: images (.png, .jpg, .gif, .svg, .webp), text (.html, .txt, .md, .css, .js, .json), PDF, and ZIP archives.",
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

    upload_id = str(uuid.uuid4())
    upload_path = Path(UPLOADS_DIR) / upload_id
    upload_path.mkdir(parents=True, exist_ok=True)

    file_list = []
    extracted_text = ""

    if ext in _ARCHIVE_EXTS:
        # Extract ZIP file with path traversal protection
        import io
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as zf:
                for member in zf.namelist():
                    member_path = Path(member)
                    if member_path.is_absolute() or ".." in member_path.parts:
                        continue
                    if not member.endswith("/") and member_path.suffix.lower() not in SAFE_EXTENSIONS:
                        continue
                    dest = upload_path / member
                    if member.endswith("/"):
                        dest.mkdir(parents=True, exist_ok=True)
                    else:
                        dest.parent.mkdir(parents=True, exist_ok=True)
                        member_bytes = zf.read(member)
                        dest.write_bytes(member_bytes)
                        file_list.append(member)
                        # Extract text from ALL readable file types
                        member_text = _extract_member_text(member_path, member_bytes, member)
                        if member_text:
                            extracted_text += member_text + "\n\n"
        except zipfile.BadZipFile:
            raise HTTPException(status_code=400, detail="Invalid ZIP file")
    elif ext in _IMAGE_EXTS:
        # Image file — store and describe
        dest = upload_path / filename
        dest.write_bytes(content)
        file_list.append(filename)
        extracted_text = _describe_image_file(filename, content)
    elif ext in _PDF_EXTS:
        # PDF file — store and attempt text extraction
        dest = upload_path / filename
        dest.write_bytes(content)
        file_list.append(filename)
        extracted_text = _extract_text_from_pdf_basic(content, filename)
    elif ext in ("html", "htm"):
        # HTML file — save as index.html for iframe preview
        dest = upload_path / "index.html"
        dest.write_bytes(content)
        file_list.append("index.html")
        extracted_text = _extract_text_from_html(content.decode("utf-8", errors="replace"))
    else:
        # Plain text file (.txt, .md, .css, .js, .json, .xml)
        dest = upload_path / filename
        dest.write_bytes(content)
        file_list.append(filename)
        extracted_text = _extract_text_from_plaintext(content, filename)

    # Determine response type
    if ext in _ARCHIVE_EXTS:
        file_type = "zip"
    elif ext in _IMAGE_EXTS:
        file_type = "image"
    elif ext in _PDF_EXTS:
        file_type = "pdf"
    else:
        file_type = "text"

    # Persist to database (non-blocking) for cross-deploy survival
    if upload_db:
        async def _save_to_db():
            try:
                await upload_db.save_upload(upload_id, filename, file_type, extracted_text.strip(), file_list)
                for member_name in file_list:
                    member_file = upload_path / member_name
                    if member_file.is_file():
                        suffix = Path(member_name).suffix.lower()
                        ct = _CONTENT_TYPES.get(suffix, "application/octet-stream")
                        await upload_db.save_file(upload_id, member_name,
                            member_file.read_bytes(), ct)
            except Exception as e:
                print(f"[upload] DB save failed: {e}")
        asyncio.create_task(_save_to_db())

    # Determine extraction quality
    trimmed_text = extracted_text.strip()
    char_count = len(trimmed_text)
    is_placeholder = trimmed_text.startswith("[") and ("provided" in trimmed_text or "could not" in trimmed_text)
    was_truncated = "...content truncated" in trimmed_text
    if char_count > 100 and not is_placeholder:
        extraction_quality = "full"
    elif char_count > 0 and not is_placeholder:
        extraction_quality = "partial"
    else:
        extraction_quality = "none"

    return {
        "id": upload_id,
        "url": f"/api/uploads/{upload_id}/",
        "type": file_type,
        "files": file_list,
        "filename": filename,
        "extracted_text": trimmed_text,
        "extraction_quality": extraction_quality,
        "char_count": char_count,
        "was_truncated": was_truncated,
    }


@app.get("/api/uploads/{upload_id}/{path:path}")
async def serve_upload(upload_id: str, path: str = "index.html"):
    """Serve uploaded/extracted static files."""
    # Security: validate upload_id and path
    if ".." in upload_id or "/" in upload_id:
        raise HTTPException(status_code=400, detail="Invalid upload ID")

    file_path = Path(UPLOADS_DIR) / upload_id / path
    resolved = file_path.resolve()
    base = Path(UPLOADS_DIR).resolve() / upload_id

    # Prevent path traversal
    if not str(resolved).startswith(str(base)):
        raise HTTPException(status_code=403, detail="Access denied")

    # Try filesystem first
    if not resolved.is_file():
        # Try database fallback (files survive Render redeploys in DB)
        if upload_db:
            db_file = await upload_db.get_file(upload_id, path)
            if db_file:
                from fastapi.responses import Response
                return Response(
                    content=db_file["content"],
                    media_type=db_file["content_type"],
                )
        raise HTTPException(status_code=404, detail="File not found")

    # Guess content type
    suffix = resolved.suffix.lower()
    media_type = _CONTENT_TYPES.get(suffix, "application/octet-stream")

    return FileResponse(str(resolved), media_type=media_type)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
