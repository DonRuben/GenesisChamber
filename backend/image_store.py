"""In-memory image store for Genesis Chamber simulations.

Stores images generated during simulation rounds, providing compact
context references for multi-round conversations instead of passing
raw base64 data (which can be 50K-200K tokens per image).
"""

import hashlib
from dataclasses import dataclass, field
from typing import Dict, List, Optional

MAX_IMAGES_PER_SIMULATION = 100
MAX_TOTAL_SIZE_MB = 500


@dataclass
class StoredImage:
    """A single stored image from a simulation."""
    image_id: str          # Short hash (first 12 chars of content hash)
    simulation_id: str
    round_num: int
    stage: str             # "creation", "refinement", "evaluation"
    model: str             # Model that generated the image
    persona_id: str        # Soul/persona that produced it
    data: str              # Base64 data URI or URL
    description: str = ""  # Alt text or prompt that generated it
    size_bytes: int = 0


@dataclass
class _SimulationImages:
    """All images for a single simulation."""
    images: Dict[str, StoredImage] = field(default_factory=dict)
    total_size: int = 0


class ImageStore:
    """Singleton in-memory store for simulation images."""

    def __init__(self):
        self._store: Dict[str, _SimulationImages] = {}

    def _content_hash(self, data: str) -> str:
        """Generate a short hash from image data for deduplication."""
        return hashlib.sha256(data.encode('utf-8', errors='replace')).hexdigest()[:12]

    def store_image(
        self,
        simulation_id: str,
        round_num: int,
        stage: str,
        model: str,
        persona_id: str,
        data: str,
        description: str = "",
    ) -> Optional[str]:
        """Store an image and return its image_id. Returns None if limits exceeded."""
        if simulation_id not in self._store:
            self._store[simulation_id] = _SimulationImages()

        sim = self._store[simulation_id]

        # Check limits
        if len(sim.images) >= MAX_IMAGES_PER_SIMULATION:
            return None

        size_bytes = len(data.encode('utf-8', errors='replace'))
        if (sim.total_size + size_bytes) > MAX_TOTAL_SIZE_MB * 1024 * 1024:
            return None

        image_id = self._content_hash(data)

        # Deduplicate — same content returns existing ID
        if image_id in sim.images:
            return image_id

        sim.images[image_id] = StoredImage(
            image_id=image_id,
            simulation_id=simulation_id,
            round_num=round_num,
            stage=stage,
            model=model,
            persona_id=persona_id,
            data=data,
            description=description,
            size_bytes=size_bytes,
        )
        sim.total_size += size_bytes
        return image_id

    def get_image(self, simulation_id: str, image_id: str) -> Optional[StoredImage]:
        """Retrieve a single stored image."""
        sim = self._store.get(simulation_id)
        if not sim:
            return None
        return sim.images.get(image_id)

    def get_simulation_images(self, simulation_id: str) -> List[StoredImage]:
        """Get all images for a simulation, ordered by round."""
        sim = self._store.get(simulation_id)
        if not sim:
            return []
        return sorted(sim.images.values(), key=lambda i: (i.round_num, i.stage))

    def get_context_references(self, simulation_id: str, up_to_round: Optional[int] = None) -> str:
        """Generate compact text references for images (30-50 tokens per image).

        Used to inject into next-round prompts instead of raw base64 data.
        """
        images = self.get_simulation_images(simulation_id)
        if not images:
            return ""

        if up_to_round is not None:
            images = [i for i in images if i.round_num <= up_to_round]

        if not images:
            return ""

        lines = ["[Previously generated images in this simulation:]"]
        for img in images:
            desc = img.description or "generated image"
            lines.append(
                f"- R{img.round_num}/{img.stage} by {img.persona_id}: {desc} [id:{img.image_id}]"
            )
        return "\n".join(lines)

    def get_image_metadata(self, simulation_id: str) -> List[Dict]:
        """Get metadata (without base64 data) for all images."""
        images = self.get_simulation_images(simulation_id)
        return [
            {
                "image_id": img.image_id,
                "round_num": img.round_num,
                "stage": img.stage,
                "model": img.model,
                "persona_id": img.persona_id,
                "description": img.description,
                "size_bytes": img.size_bytes,
            }
            for img in images
        ]

    def cleanup_simulation(self, simulation_id: str) -> None:
        """Remove all stored images for a simulation."""
        if simulation_id in self._store:
            del self._store[simulation_id]

    @property
    def total_simulations(self) -> int:
        return len(self._store)

    @property
    def total_images(self) -> int:
        return sum(len(s.images) for s in self._store.values())


# Module-level singleton
image_store = ImageStore()
