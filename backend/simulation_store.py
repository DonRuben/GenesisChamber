"""Simulation state persistence — save, load, list, and resume simulations."""

import json
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

from .config import SIMULATION_OUTPUT_DIR
from .models import SimulationState


class SimulationStore:
    """Persists simulation state to JSON files in output/{sim_id}/."""

    def __init__(self, output_dir: str = SIMULATION_OUTPUT_DIR):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def _sim_dir(self, sim_id: str) -> Path:
        """Get or create the directory for a simulation."""
        d = self.output_dir / sim_id
        d.mkdir(parents=True, exist_ok=True)
        return d

    def save_state(self, state: SimulationState):
        """Save full simulation state to disk."""
        sim_dir = self._sim_dir(state.id)
        path = sim_dir / "state.json"

        data = state.model_dump(mode="json")
        with open(path, "w") as f:
            json.dump(data, f, indent=2, default=str)

    def load_state(self, sim_id: str) -> Optional[SimulationState]:
        """Load simulation state from disk."""
        path = self._sim_dir(sim_id) / "state.json"
        if not path.exists():
            return None

        with open(path, "r") as f:
            data = json.load(f)

        return SimulationState(**data)

    def list_simulations(self) -> List[Dict[str, Any]]:
        """List all simulations with metadata."""
        simulations = []

        if not self.output_dir.exists():
            return simulations

        for entry in self.output_dir.iterdir():
            if entry.is_dir():
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
                        })
                    except (json.JSONDecodeError, KeyError):
                        continue

        simulations.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return simulations

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

        if decision == "approved":
            state.status = "running"
        elif decision == "redirected":
            state.status = "running"

        self.save_state(state)
        return state

    def delete_simulation(self, sim_id: str) -> bool:
        """Delete a simulation and its data."""
        import shutil
        sim_dir = self.output_dir / sim_id
        if sim_dir.exists():
            shutil.rmtree(sim_dir)
            return True
        return False
