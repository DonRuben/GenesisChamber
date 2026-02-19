"""Image Generator — fal.ai integration for concept visualization."""

import asyncio
import json
from pathlib import Path
from typing import Dict, Any, List, Optional

import httpx

from .config import FAL_KEY, SIMULATION_OUTPUT_DIR


# fal.ai model endpoints (via queue API) — Updated Feb 2026
FAL_MODELS = {
    "nano_banana_pro":    "fal-ai/nano-banana-pro",                        # Google Gemini 3 Pro Image — fast, high quality, $0.15/img
    "nano_banana_edit":   "fal-ai/nano-banana-pro/edit",                   # Google Gemini 3 Pro — image editing mode
    "recraft_v4":         "fal-ai/recraft/v4/text-to-image",               # Recraft V4 — raster images, $0.04/img
    "recraft_v4_vector":  "fal-ai/recraft/v4/pro/text-to-vector",          # Recraft V4 Pro — SVG vectors, $0.30/img
    "flux_2_pro":         "fal-ai/flux-2-pro",                             # Flux 2 Pro — photorealistic, editorial
    "flux_2_max":         "fal-ai/flux-2-max",                             # Flux 2 Max — highest quality photorealistic
    "seedream_4_5":       "fal-ai/bytedance/seedream/v4.5/text-to-image",  # ByteDance Seedream 4.5 — creative, artistic, $0.04/img
    "ideogram_v3":        "fal-ai/ideogram/v3",                            # Ideogram V3 — typography, text in images
}

# Human-readable names for the UI
FAL_MODEL_NAMES = {
    "nano_banana_pro":   "Nano Banana Pro (Google)",
    "nano_banana_edit":  "Nano Banana Pro Edit",
    "recraft_v4":        "Recraft V4",
    "recraft_v4_vector": "Recraft V4 Pro (Vector/SVG)",
    "flux_2_pro":        "Flux 2 Pro",
    "flux_2_max":        "Flux 2 Max",
    "seedream_4_5":      "Seedream 4.5 (ByteDance)",
    "ideogram_v3":       "Ideogram V3",
}

FAL_API_URL = "https://queue.fal.run"

# Fallback chain if preferred model fails
FALLBACK_CHAIN = ["nano_banana_pro", "seedream_4_5", "flux_2_pro"]


class ImageGenerator:
    """Generates images from concept prompts via fal.ai."""

    def __init__(self, api_key: str = FAL_KEY, output_dir: str = SIMULATION_OUTPUT_DIR):
        self.api_key = api_key
        self.output_dir = Path(output_dir)

    def select_model(self, concept: Dict[str, Any]) -> str:
        """Select the best fal.ai model based on concept characteristics.

        - Text/typography/logo → ideogram_v3
        - Brand system/vector/icon → recraft_v4
        - Photorealistic/lifestyle → flux_2_pro
        - Artistic/creative/dreamlike → seedream_4_5
        - Default → nano_banana_pro (fast, high quality)
        """
        prompt = (concept.get("prompt", "") or "").lower()
        visual = (concept.get("visual_direction", "") or "").lower()
        combined = prompt + " " + visual

        text_keywords = ["text", "typography", "logo", "lettering", "words", "headline", "type"]
        brand_keywords = ["icon", "logo", "brand system", "vector", "symbol", "geometric", "badge"]
        photo_keywords = ["photo", "realistic", "editorial", "lifestyle", "portrait", "cinematic", "product shot"]
        art_keywords = ["artistic", "creative", "dreamlike", "abstract", "surreal", "painterly", "illustration", "watercolor"]

        if any(kw in combined for kw in text_keywords):
            return "ideogram_v3"
        elif any(kw in combined for kw in brand_keywords):
            return "recraft_v4"
        elif any(kw in combined for kw in photo_keywords):
            return "flux_2_pro"
        elif any(kw in combined for kw in art_keywords):
            return "seedream_4_5"
        else:
            return "nano_banana_pro"

    async def generate_image(
        self,
        prompt: str,
        model_key: str = "nano_banana_pro",
        width: int = 1024,
        height: int = 1024,
    ) -> Optional[Dict[str, Any]]:
        """Generate a single image via fal.ai.

        Returns dict with 'url', 'model', 'prompt' or None on failure.
        """
        if not self.api_key:
            print("Warning: FAL_KEY not set, skipping image generation")
            return None

        model_id = FAL_MODELS.get(model_key, FAL_MODELS["nano_banana_pro"])

        headers = {
            "Authorization": f"Key {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "prompt": prompt,
            "image_size": {"width": width, "height": height},
            "num_images": 1,
        }

        if model_key == "recraft_v4":
            payload["style"] = "digital_illustration"

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{FAL_API_URL}/{model_id}",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

                # fal.ai returns images in data.images[0].url or data.output.url
                images = data.get("images", [])
                if images:
                    return {
                        "url": images[0].get("url"),
                        "model": model_key,
                        "prompt": prompt,
                    }

                # Fallback: check output field
                output = data.get("output", {})
                if isinstance(output, dict) and output.get("url"):
                    return {
                        "url": output["url"],
                        "model": model_key,
                        "prompt": prompt,
                    }

                return None

        except Exception as e:
            print(f"Error generating image with {model_key}: {e}")
            return None

    async def generate_with_fallback(
        self,
        prompt: str,
        preferred_model: str = "nano_banana_pro",
    ) -> Optional[Dict[str, Any]]:
        """Try preferred model, then fall back through chain."""
        result = await self.generate_image(prompt, preferred_model)
        if result:
            return result

        for model_key in FALLBACK_CHAIN:
            if model_key == preferred_model:
                continue
            result = await self.generate_image(prompt, model_key)
            if result:
                return result

        return None

    async def generate_batch(
        self,
        prompts: List[Dict[str, Any]],
        sim_id: str,
        model_override: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Generate images for all concept prompts.

        Args:
            prompts: List of dicts with 'concept_name', 'prompt', 'persona', 'status'
            sim_id: Simulation ID for output directory
            model_override: If set, use this model for all images instead of auto-selection

        Returns:
            List of result dicts with 'concept_name', 'url', 'model', 'prompt'
        """
        results = []

        for prompt_data in prompts:
            model_key = model_override if model_override and model_override in FAL_MODELS else self.select_model(prompt_data)
            result = await self.generate_with_fallback(
                prompt=prompt_data["prompt"],
                preferred_model=model_key,
            )

            if result:
                result["concept_name"] = prompt_data.get("concept_name", "Unknown")
                result["persona"] = prompt_data.get("persona", "Unknown")
                results.append(result)

            # Brief delay to avoid rate limiting
            await asyncio.sleep(1.0)

        # Save results
        sim_dir = self.output_dir / sim_id
        sim_dir.mkdir(parents=True, exist_ok=True)
        results_path = sim_dir / "generated_images.json"
        results_path.write_text(json.dumps(results, indent=2), encoding="utf-8")

        return results
