"""FastAPI backend for LLM Council + Genesis Chamber."""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import json
import asyncio
from pathlib import Path

import os

from . import storage
from .council import run_full_council, generate_conversation_title, stage1_collect_responses, stage2_collect_rankings, stage3_synthesize_final, calculate_aggregate_rankings
from .models import StartSimulationRequest, GateApprovalRequest, SimulationConfig, ParticipantConfig
from .simulation import GenesisSimulation
from .simulation_store import SimulationStore
from .config import (
    SIMULATION_PRESETS, DEFAULT_PARTICIPANTS, DEFAULT_MODERATOR,
    DEFAULT_EVALUATOR, SOULS_DIR, PERSONA_COLORS, SIMULATION_OUTPUT_DIR,
)
from .output_engine import OutputEngine
from .image_generator import ImageGenerator
from .video_generator import VideoGenerator, VIDEO_QUALITY_TIERS

app = FastAPI(title="LLM Council + Genesis Chamber API")
simulation_store = SimulationStore()

# CORS — configurable via ALLOWED_ORIGINS env var (comma-separated)
_default_origins = "http://localhost:5173,http://localhost:3000,https://genesis-chamber-two.vercel.app"
_allowed_origins = os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CreateConversationRequest(BaseModel):
    """Request to create a new conversation."""
    pass


class SendMessageRequest(BaseModel):
    """Request to send a message in a conversation."""
    content: str


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
            stage1_results = await stage1_collect_responses(request.content)
            yield f"data: {json.dumps({'type': 'stage1_complete', 'data': stage1_results})}\n\n"

            # Stage 2: Collect rankings
            yield f"data: {json.dumps({'type': 'stage2_start'})}\n\n"
            stage2_results, label_to_model = await stage2_collect_rankings(request.content, stage1_results)
            aggregate_rankings = calculate_aggregate_rankings(stage2_results, label_to_model)
            yield f"data: {json.dumps({'type': 'stage2_complete', 'data': stage2_results, 'metadata': {'label_to_model': label_to_model, 'aggregate_rankings': aggregate_rankings}})}\n\n"

            # Stage 3: Synthesize final answer
            yield f"data: {json.dumps({'type': 'stage3_start'})}\n\n"
            stage3_result = await stage3_synthesize_final(request.content, stage1_results, stage2_results)
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


# === GENESIS CHAMBER ENDPOINTS ===

# In-memory registry of running simulations
_running_simulations: Dict[str, GenesisSimulation] = {}


@app.get("/api/souls")
async def list_souls():
    """List available soul documents."""
    souls_path = Path(SOULS_DIR)
    if not souls_path.exists():
        return []

    souls = []
    for f in sorted(souls_path.glob("*.md")):
        persona_id = f.stem
        # Read first few lines to get name
        with open(f, "r") as fh:
            first_lines = fh.read(500)
        # Extract name from # SOUL DOCUMENT: NAME or # NAME
        import re
        name_match = re.search(r'^#\s+(?:SOUL DOCUMENT:\s*)?(.+)', first_lines, re.MULTILINE)
        name = name_match.group(1).strip() if name_match else persona_id.replace("-", " ").title()

        souls.append({
            "id": persona_id,
            "name": name,
            "file": str(f),
            "color": PERSONA_COLORS.get(persona_id, "#666666"),
        })

    return souls


@app.get("/api/simulation/presets")
async def list_presets():
    """List available simulation presets."""
    return SIMULATION_PRESETS


@app.get("/api/simulations")
async def list_simulations():
    """List all simulations."""
    return simulation_store.list_simulations()


@app.post("/api/simulation/start")
async def start_simulation(request: StartSimulationRequest, background_tasks: BackgroundTasks):
    """Start a new simulation. Returns sim_id immediately, runs in background."""
    config = request.config
    sim = GenesisSimulation(config)
    _running_simulations[sim.sim_id] = sim

    async def run_sim():
        try:
            await sim.run()
        except Exception as e:
            sim.state.status = "failed"
            sim.state.event_log.append({
                "type": "error",
                "message": str(e),
            })
            simulation_store.save_state(sim.state)
        finally:
            _running_simulations.pop(sim.sim_id, None)

    background_tasks.add_task(asyncio.ensure_future, run_sim())

    return {"sim_id": sim.sim_id, "status": "started"}


@app.post("/api/simulation/start/stream")
async def start_simulation_stream(request: StartSimulationRequest):
    """Start a new simulation with SSE streaming."""
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

        async def run_and_signal():
            try:
                yield_data = {"type": "simulation_started", "sim_id": sim.sim_id}
                await event_queue.put(yield_data)

                await sim.run(
                    on_stage_complete=on_stage,
                    on_round_complete=on_round,
                    on_gate_reached=on_gate,
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
        return {
            "id": sim_id,
            "status": sim.state.status,
            "current_round": sim.state.current_round,
            "current_stage": sim.state.current_stage,
            "current_stage_name": sim.state.current_stage_name,
            "total_rounds": sim.config.rounds,
        }

    # Check stored state
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")

    return {
        "id": sim_id,
        "status": state.status,
        "current_round": state.current_round,
        "current_stage": state.current_stage,
        "current_stage_name": state.current_stage_name,
        "total_rounds": state.config.rounds,
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


@app.post("/api/simulation/{sim_id}/generate-images")
async def generate_images(sim_id: str):
    """Generate images for all concept image prompts via fal.ai."""
    state = simulation_store.load_state(sim_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")

    engine = OutputEngine()
    sim_dir = Path(SIMULATION_OUTPUT_DIR) / sim_id
    sim_dir.mkdir(parents=True, exist_ok=True)
    prompts_path = engine.generate_image_prompts(state, sim_dir)

    with open(prompts_path) as f:
        prompts = json.load(f)

    if not prompts:
        return {"status": "no_prompts", "count": 0}

    generator = ImageGenerator()

    async def run_generation():
        await generator.generate_batch(prompts, sim_id)

    asyncio.create_task(run_generation())

    return {"status": "generating", "count": len(prompts)}


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


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
