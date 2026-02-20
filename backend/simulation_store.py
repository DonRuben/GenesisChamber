"""Simulation state persistence — hybrid DB + file storage.

Uses database when DATABASE_URL is configured, always writes files as backup.
Falls back to file-only when no database is available.
"""

import json
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

from .config import SIMULATION_OUTPUT_DIR
from .models import SimulationState
from .database import SimulationDB, is_db_available


class SimulationStore:
    """Hybrid store: uses database when available, falls back to file-based."""

    def __init__(self, output_dir: str = SIMULATION_OUTPUT_DIR):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self._db = SimulationDB() if is_db_available() else None

    def _sim_dir(self, sim_id: str) -> Path:
        d = self.output_dir / sim_id
        d.mkdir(parents=True, exist_ok=True)
        return d

    # --- File-based methods (always available) ---

    def _save_file(self, state: SimulationState):
        sim_dir = self._sim_dir(state.id)
        path = sim_dir / "state.json"
        data = state.model_dump(mode="json")
        with open(path, "w") as f:
            json.dump(data, f, indent=2, default=str)

    def _load_file(self, sim_id: str) -> Optional[SimulationState]:
        path = self._sim_dir(sim_id) / "state.json"
        if not path.exists():
            return None
        with open(path, "r") as f:
            data = json.load(f)
        return SimulationState(**data)

    def _list_files(self) -> List[Dict[str, Any]]:
        simulations = []
        if not self.output_dir.exists():
            return simulations
        for entry in self.output_dir.iterdir():
            if entry.is_dir() and entry.name != "uploads":
                state_path = entry / "state.json"
                if state_path.exists():
                    try:
                        with open(state_path, "r") as f:
                            data = json.load(f)
                        simulations.append({
                            "id": data.get("id", entry.name),
                            "name": data.get("config", {}).get("name", "Unnamed"),
                            "type": data.get("config", {}).get("type", "unknown"),
                            "status": data.get("status", "unknown"),
                            "created_at": data.get("created_at", ""),
                            "current_round": data.get("current_round", 0),
                            "total_rounds": data.get("config", {}).get("rounds", 0),
                            "archived": data.get("archived", False),
                        })
                    except (json.JSONDecodeError, KeyError):
                        continue
        simulations.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return simulations

    # --- Hybrid methods (DB when available, file fallback) ---

    def save_state(self, state: SimulationState):
        """Sync save — always writes file, schedules async DB write."""
        self._save_file(state)
        if self._db:
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(self._db.save_state(state))
            except RuntimeError:
                pass  # No running event loop — file save is sufficient

    async def save_state_async(self, state: SimulationState):
        """Async save — tries DB first, always writes file as backup."""
        if self._db:
            try:
                await asyncio.wait_for(self._db.save_state(state), timeout=10)
            except asyncio.TimeoutError:
                print(f"[store] DB save timeout (10s), file fallback")
            except Exception as e:
                print(f"[store] DB save failed, file fallback: {e}")
        self._save_file(state)

    def load_state(self, sim_id: str) -> Optional[SimulationState]:
        """Sync load — file only (DB requires async)."""
        return self._load_file(sim_id)

    async def load_state_async(self, sim_id: str) -> Optional[SimulationState]:
        """Async load — tries DB first, falls back to file."""
        if self._db:
            try:
                state = await self._db.load_state(sim_id)
                if state:
                    return state
            except Exception as e:
                print(f"[store] DB load failed, file fallback: {e}")
        return self._load_file(sim_id)

    def list_simulations(self) -> List[Dict[str, Any]]:
        """Sync list — file only."""
        return self._list_files()

    async def list_simulations_async(self) -> List[Dict[str, Any]]:
        """Async list — tries DB first, falls back to file."""
        if self._db:
            try:
                results = await self._db.list_simulations()
                if results:
                    return results
            except Exception as e:
                print(f"[store] DB list failed, file fallback: {e}")
        return self._list_files()

    def save_quality_gate(self, sim_id: str, gate_round: int,
                          decision: str, notes: str = ""):
        """Update a quality gate decision."""
        state = self.load_state(sim_id)
        if not state:
            raise ValueError(f"Simulation {sim_id} not found")

        for gate in state.quality_gates:
            if gate.get("after_round") == gate_round:
                gate["status"] = decision
                gate["notes"] = notes
                gate["decided_at"] = datetime.utcnow().isoformat()
                break

        if decision in ("approved", "redirected"):
            state.status = "running"

        self.save_state(state)
        return state

    def rename_simulation(self, sim_id: str, name: str):
        """Rename a simulation by updating its config name."""
        state = self.load_state(sim_id)
        if not state:
            raise ValueError(f"Simulation {sim_id} not found")
        state.config.name = name
        self.save_state(state)
        return state

    def archive_simulation(self, sim_id: str, archived: bool = True):
        """Set or clear the archived flag on a simulation."""
        state = self.load_state(sim_id)
        if not state:
            raise ValueError(f"Simulation {sim_id} not found")
        state.archived = archived
        self.save_state(state)
        return state

    def delete_simulation(self, sim_id: str) -> bool:
        """Delete a simulation from both DB and file."""
        import shutil
        deleted = False

        # Delete from filesystem
        sim_dir = self.output_dir / sim_id
        if sim_dir.exists():
            shutil.rmtree(sim_dir)
            deleted = True

        # Schedule DB deletion
        if self._db:
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(self._db.delete_simulation(sim_id))
                deleted = True
            except RuntimeError:
                pass

        return deleted
