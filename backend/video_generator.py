"""Video Generator — fal.ai integration for concept video visualization.

Optional post-processing step for winner/finalist concepts.
Same architecture as image_generator.py.
"""

import asyncio
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

import httpx

from .config import FAL_KEY, SIMULATION_OUTPUT_DIR


# fal.ai video model endpoints (via queue API) — Updated Feb 2026
# Using httpx direct REST calls (same pattern as image_generator.py)
FAL_VIDEO_MODELS = {
    # Image-to-Video (Hero tier: Kling 3.0 Pro / Kling O3 Pro)
    "kling_3_i2v":      "fal-ai/kling-video/v3/pro/image-to-video",            # Kling 3.0 Pro — cinematic, native audio
    "kling_o3_i2v":     "fal-ai/kling-video/o3/pro/image-to-video",            # Kling O3 Pro — premium tier
    # Image-to-Video (Standard tier: MiniMax Hailuo 2.3)
    "minimax_i2v":      "fal-ai/minimax/hailuo-2.3/pro/image-to-video",        # MiniMax Hailuo 2.3 Pro — 1080p
    "minimax_fast_i2v": "fal-ai/minimax/hailuo-2.3-fast/pro/image-to-video",   # MiniMax Hailuo 2.3 Fast — cheaper
    # Image-to-Video (Draft tier: Luma)
    "luma_i2v":         "fal-ai/luma-dream-machine/ray-2/image-to-video",      # Luma Ray 2 — fast, affordable
    # Text-to-Video
    "kling_o3_t2v":     "fal-ai/kling-video/o3/pro/text-to-video",             # Kling O3 Pro — top quality t2v
    "veo_3_1_t2v":      "fal-ai/veo3.1",                                       # Google Veo 3.1 — cinematic, atmospheric
    "veo_3_1_extend":   "fal-ai/veo3.1/extend-video",                          # Google Veo 3.1 — extend/continue existing video
    "minimax_t2v":      "fal-ai/minimax/hailuo-2.3/pro/text-to-video",         # MiniMax Hailuo 2.3 Pro t2v
    "luma_t2v":         "fal-ai/luma-dream-machine/ray-2",                     # Luma Ray 2 — draft t2v
}

# Human-readable names for the UI
FAL_VIDEO_MODEL_NAMES = {
    "kling_3_i2v": "Kling 3.0 (I2V)",
    "kling_o3_i2v": "Kling O3 (I2V)",
    "minimax_i2v": "MiniMax Hailuo 2.3 Pro (I2V)",
    "minimax_fast_i2v": "MiniMax Hailuo 2.3 Fast (I2V)",
    "luma_i2v": "Luma Ray 2 (I2V)",
    "kling_o3_t2v": "Kling O3 Pro (T2V)",
    "minimax_t2v": "MiniMax Hailuo 2.3 Pro (T2V)",
    "veo_3_1_t2v": "Google Veo 3.1",
    "veo_3_1_extend": "Google Veo 3.1 (Extend)",
    "luma_t2v": "Luma Ray 2 (T2V)",
}

FAL_API_URL = "https://queue.fal.run"

# Fallback chains
I2V_FALLBACK_CHAIN = ["kling_3_i2v", "minimax_i2v", "luma_i2v"]
T2V_FALLBACK_CHAIN = ["kling_o3_t2v", "minimax_t2v", "luma_t2v"]

# Quality tiers for user selection
VIDEO_QUALITY_TIERS = {
    "hero": {
        "description": "Best quality — Kling 3.0, cinematic, 10s, 1080p, native audio",
        "i2v": "kling_3_i2v",
        "t2v": "kling_o3_t2v",
        "duration": "10",
        "resolution": "1080p",
        "cost_estimate": "$0.80–$1.50 per clip",
    },
    "standard": {
        "description": "Production quality — MiniMax Hailuo 2.3, 6s, 1080p",
        "i2v": "minimax_i2v",
        "t2v": "minimax_t2v",
        "duration": "6",
        "resolution": "1080p",
        "cost_estimate": "$0.30–$0.55 per clip",
    },
    "draft": {
        "description": "Fast iteration — Luma Ray 2, 5s, 540p",
        "i2v": "luma_i2v",
        "t2v": "luma_t2v",
        "duration": "5",
        "resolution": "540p",
        "cost_estimate": "$0.15–$0.25 per clip",
    },
}


class VideoGenerator:
    """Generates videos from concept prompts/images via fal.ai.

    Designed as an optional post-processing step for winner/finalist concepts.
    """

    def __init__(self, api_key: str = FAL_KEY, output_dir: str = SIMULATION_OUTPUT_DIR):
        self.api_key = api_key
        self.output_dir = Path(output_dir)

    def select_model(self, concept: Dict[str, Any], quality: str = "standard") -> str:
        """Select video model based on concept and whether we have a source image.

        If concept has 'image_url', use image-to-video (preferred — better results).
        Otherwise fall back to text-to-video.
        """
        tier = VIDEO_QUALITY_TIERS.get(quality, VIDEO_QUALITY_TIERS["standard"])

        if concept.get("image_url"):
            return tier["i2v"]
        else:
            return tier["t2v"]

    def _build_payload(
        self,
        prompt: str,
        model_key: str,
        image_url: Optional[str] = None,
        duration: str = "5",
        aspect_ratio: str = "16:9",
    ) -> Dict[str, Any]:
        """Build model-specific payload."""
        payload: Dict[str, Any] = {"prompt": prompt}

        if image_url and "_i2v" in model_key:
            payload["image_url"] = image_url

        # Model-specific parameters
        if "kling" in model_key:
            payload["duration"] = duration
            payload["aspect_ratio"] = aspect_ratio
            payload["negative_prompt"] = "blur, distort, low quality, watermark"
        elif "minimax" in model_key:
            dur = int(duration) if duration.isdigit() else 6
            payload["duration"] = min(dur, 6)
            payload["prompt_optimizer"] = True
        elif "luma" in model_key:
            payload["aspect_ratio"] = aspect_ratio
            payload["duration"] = f"{duration}s" if not duration.endswith("s") else duration
            payload["loop"] = False

        return payload

    async def generate_video(
        self,
        prompt: str,
        model_key: str = "minimax_t2v",
        image_url: Optional[str] = None,
        duration: str = "5",
        aspect_ratio: str = "16:9",
    ) -> Optional[Dict[str, Any]]:
        """Generate a single video via fal.ai.

        Returns dict with 'url', 'model', 'prompt' or None on failure.
        """
        if not self.api_key:
            print("Warning: FAL_KEY not set, skipping video generation")
            return None

        model_id = FAL_VIDEO_MODELS.get(model_key)
        if not model_id:
            print(f"Warning: Unknown video model key '{model_key}'")
            return None

        headers = {
            "Authorization": f"Key {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = self._build_payload(prompt, model_key, image_url, duration, aspect_ratio)

        try:
            # Video generation takes longer — use 5 minute timeout
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    f"{FAL_API_URL}/{model_id}",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

                # fal.ai video responses vary by model:
                # - Kling: data.video.url
                # - Minimax: data.video.url
                # - Luma: data.video.url
                video = data.get("video", {})
                if isinstance(video, dict) and video.get("url"):
                    return {
                        "url": video["url"],
                        "model": model_key,
                        "prompt": prompt,
                        "duration": duration,
                    }

                # Fallback: check data.output or data.url
                if data.get("url"):
                    return {
                        "url": data["url"],
                        "model": model_key,
                        "prompt": prompt,
                        "duration": duration,
                    }

                output = data.get("output", {})
                if isinstance(output, dict) and output.get("url"):
                    return {
                        "url": output["url"],
                        "model": model_key,
                        "prompt": prompt,
                        "duration": duration,
                    }

                print(f"Warning: No video URL in response from {model_key}")
                return None

        except httpx.TimeoutException:
            print(f"Timeout generating video with {model_key} (>300s)")
            return None
        except Exception as e:
            print(f"Error generating video with {model_key}: {e}")
            return None

    async def generate_with_fallback(
        self,
        prompt: str,
        preferred_model: str = "minimax_t2v",
        image_url: Optional[str] = None,
        duration: str = "5",
    ) -> Optional[Dict[str, Any]]:
        """Try preferred model, then fall back through chain."""
        result = await self.generate_video(prompt, preferred_model, image_url, duration)
        if result:
            return result

        # Pick fallback chain based on mode (i2v vs t2v)
        chain = I2V_FALLBACK_CHAIN if "_i2v" in preferred_model else T2V_FALLBACK_CHAIN

        for model_key in chain:
            if model_key == preferred_model:
                continue
            result = await self.generate_video(prompt, model_key, image_url, duration)
            if result:
                return result

        return None

    async def generate_for_concepts(
        self,
        concepts: List[Dict[str, Any]],
        sim_id: str,
        quality: str = "standard",
    ) -> List[Dict[str, Any]]:
        """Generate videos for winner/finalist concepts.

        Args:
            concepts: List of dicts with 'concept_name', 'prompt' (video_prompt or image_prompt),
                      'persona', 'status', optionally 'image_url' from prior image generation
            sim_id: Simulation ID for output directory
            quality: Quality tier — 'hero', 'standard', or 'draft'

        Returns:
            List of result dicts with 'concept_name', 'url', 'model', 'prompt'
        """
        tier = VIDEO_QUALITY_TIERS.get(quality, VIDEO_QUALITY_TIERS["standard"])
        results = []

        # V3: Create sim_dir before loop so media download can use it
        sim_dir = self.output_dir / sim_id
        sim_dir.mkdir(parents=True, exist_ok=True)

        for concept_data in concepts:
            model_key = self.select_model(concept_data, quality)
            image_url = concept_data.get("image_url")
            prompt = concept_data.get("prompt", "")

            result = await self.generate_with_fallback(
                prompt=prompt,
                preferred_model=model_key,
                image_url=image_url,
                duration=tier.get("duration", "5"),
            )

            if result:
                result["concept_name"] = concept_data.get("concept_name", "Unknown")
                result["persona"] = concept_data.get("persona", "Unknown")
                result["quality_tier"] = quality
                results.append(result)

                # ── V3: Download video file to persist locally ──
                if result.get("url"):
                    try:
                        media_dir = sim_dir / "media" / "videos"
                        media_dir.mkdir(parents=True, exist_ok=True)
                        safe_name = re.sub(r'[^a-z0-9_-]', '_', result["concept_name"].lower())[:50]
                        filename = f"{safe_name}_{model_key}.mp4"
                        filepath = media_dir / filename

                        async with httpx.AsyncClient(timeout=180.0) as dl_client:
                            vid_response = await dl_client.get(result["url"])
                            vid_response.raise_for_status()
                            filepath.write_bytes(vid_response.content)

                        result["local_path"] = f"{sim_id}/media/videos/{filename}"
                        result["filename"] = filename
                        result["file_size"] = len(vid_response.content)
                        result["generated_at"] = datetime.utcnow().isoformat()
                        print(f"[Media] Downloaded video {filename} ({len(vid_response.content)} bytes)")
                    except Exception as e:
                        print(f"[Media] Warning: Failed to download video: {e}")
                        result["local_path"] = None

            # Longer delay for video — avoid rate limiting
            await asyncio.sleep(3.0)

        # Save results
        results_path = sim_dir / "generated_videos.json"
        results_path.write_text(json.dumps(results, indent=2), encoding="utf-8")

        return results
