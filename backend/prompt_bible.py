"""Prompt Engineering Bible — model-specific optimization for fal.ai generation.

Each fal.ai model has different strengths and expects different prompt structures.
This module transforms creative concept descriptions into technically optimized
prompts for each specific model.

Research sources:
- Flux 2 Pro/Max: https://docs.bfl.ml/guides/prompting_guide_flux2
  → Subject + Action + Style + Context, no negative prompts, HEX color support,
    camera model references, JSON prompting for complex scenes
- Veo 3.1: https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1
  → JSON prompting (300%+ better consistency), cinematic terminology,
    camera/lighting/audio/style fields, front-load intent
- Seedream 4.5: https://fal.ai/learn/devs/seedream-v4-5-prompt-guide
  → Natural language, concise (30-100 words), subject+action+environment+style,
    excellent typography, style sensitivity (earlier words get more weight)
- Ideogram V3: Typography-first, text in quotes, font style + layout focus
- Recraft V4: API style parameter, brand/geometric descriptors
"""

import json
import re
from typing import Dict, Any, Optional


# ═══════════════════════════════════════════════════════════════
# MODEL PROMPT STRATEGIES — Researched from official documentation
# ═══════════════════════════════════════════════════════════════

MODEL_STRATEGIES: Dict[str, Dict[str, Any]] = {

    # ─── FLUX 2 PRO ─────────────────────────────────────────
    # Best for: photorealistic, editorial, product photography
    # Source: https://docs.bfl.ml/guides/prompting_guide_flux2
    "flux_2_pro": {
        "name": "Flux 2 Pro",
        "category": "image",
        "strengths": ["photorealistic", "editorial", "product", "hex_colors", "camera_simulation"],
        "prompt_rules": {
            "structure": "Subject + Action + Style + Context (subject FIRST — earlier words get more weight)",
            "supports_negative": False,
            "supports_json": True,
            "supports_hex_colors": True,
            "max_length": None,
        },
        "style_map": {
            "photorealistic": "professional photography, sharp focus, high detail, photorealistic rendering",
            "editorial": "editorial fashion photography, high contrast, bold colors, magazine quality, dramatic composition",
            "product": "professional product photography, studio lighting, clean background, commercial quality, sharp detail",
            "cinematic": "cinematic still, anamorphic lens flare, dramatic chiaroscuro lighting, film grain, 35mm",
            "lifestyle": "lifestyle photography, natural window light, candid feel, authentic moment, warm tones",
            "architectural": "architectural photography, clean lines, balanced composition, natural light, wide angle",
        },
        "camera_map": {
            "portrait": "shot on Canon RF 85mm f/1.2L at f/2.0, shallow depth of field, soft background bokeh",
            "product": "shot on 100mm macro lens, focus stacking, clean white background, even studio lighting",
            "wide": "shot on 24mm lens at f/8, deep focus, expansive composition, leading lines",
            "cinematic": "shot on Arri Alexa with Cooke S4/i 40mm anamorphic, 2.39:1, natural bokeh",
            "documentary": "shot on Sony A7IV, 35mm lens, natural available light, candid framing",
        },
        "quality_suffix": "professional quality, sharp focus, high detail, 4K resolution",
    },

    "flux_2_max": {
        "name": "Flux 2 Max",
        "category": "image",
        "inherits": "flux_2_pro",
        "quality_suffix": "ultra-detailed, 8K resolution, highest fidelity, professional quality",
    },

    # ─── SEEDREAM 4.5 ────────────────────────────────────────
    # Best for: artistic, creative, typography, style variety
    # Source: https://fal.ai/learn/devs/seedream-v4-5-prompt-guide
    "seedream_4_5": {
        "name": "Seedream 4.5 (ByteDance)",
        "category": "image",
        "strengths": ["artistic", "creative", "typography", "posters", "text_in_images", "style_variety"],
        "prompt_rules": {
            "structure": "Subject + Action + Environment + Style (concise natural language)",
            "supports_negative": False,
            "supports_json": False,
            "supports_hex_colors": False,
            "optimal_length_words": [30, 100],
        },
        "style_map": {
            "artistic": "artistic composition, creative visual concept, dreamlike quality",
            "poster": "professional poster design, clean typography, balanced visual hierarchy",
            "painterly": "oil painting style, rich visible brushstrokes, textured canvas feel",
            "surreal": "surrealist composition, impossible geometry, dreamscape atmosphere",
            "commercial": "commercial advertising aesthetic, clean professional grade, polished",
            "watercolor": "delicate watercolor style, soft washes, visible paper texture, artistic",
            "anime": "high-quality anime style, detailed character design, vibrant colors",
        },
        "quality_suffix": "high quality, detailed",
    },

    # ─── IDEOGRAM V3 ────────────────────────────────────────
    # Best for: typography, text in images, logos, infographics
    "ideogram_v3": {
        "name": "Ideogram V3",
        "category": "image",
        "strengths": ["typography", "text_rendering", "logos", "infographics", "layout", "signage"],
        "prompt_rules": {
            "structure": "Text content in quotes + font style + layout + background + style",
            "supports_negative": False,
            "supports_json": False,
            "supports_hex_colors": False,
            "text_in_quotes": True,  # Critical: put desired text in quotation marks
        },
        "style_map": {
            "logo": "professional logo design, clean vector aesthetic, balanced proportions",
            "poster": "professional poster layout, clear visual hierarchy, impactful typography",
            "signage": "realistic signage, mounted on surface, contextual environment",
            "infographic": "clean infographic layout, organized data visualization, modern design",
        },
        "quality_suffix": "clean typography, professional layout, readable text, high resolution",
    },

    # ─── RECRAFT V4 ─────────────────────────────────────────
    # Best for: brand systems, icons, digital illustration
    "recraft_v4": {
        "name": "Recraft V4",
        "category": "image",
        "strengths": ["brand_systems", "icons", "digital_illustration", "geometric", "vector_style"],
        "prompt_rules": {
            "structure": "Subject + style + color scheme + composition",
            "supports_negative": False,
            "supports_json": False,
            "supports_hex_colors": False,
            "api_style_param": "digital_illustration",  # Set in API call
        },
        "style_map": {
            "icon": "clean icon design, flat style, balanced proportions, consistent stroke weight",
            "brand": "brand identity element, professional design system, cohesive visual language",
            "illustration": "digital illustration, clean lines, modern aesthetic, vibrant colors",
            "geometric": "geometric design, clean shapes, mathematical precision, modern",
        },
        "quality_suffix": "clean design, professional quality, balanced composition",
    },

    # ─── NANO BANANA PRO ────────────────────────────────────
    # Google Gemini 3 Pro Image — versatile fast default
    "nano_banana_pro": {
        "name": "Nano Banana Pro (Google)",
        "category": "image",
        "strengths": ["versatile", "fast", "text_rendering", "general_purpose"],
        "prompt_rules": {
            "structure": "Natural language, subject first",
            "supports_negative": False,
            "supports_json": False,
            "supports_hex_colors": False,
        },
        "style_map": {
            "photorealistic": "photorealistic, professional photography, sharp detail",
            "artistic": "artistic, creative composition, rich visual style",
            "commercial": "commercial quality, clean professional aesthetic",
        },
        "quality_suffix": "high quality, detailed, professional",
    },

    # ═════════════════════════════════════════════════════════
    # VIDEO MODELS
    # ═════════════════════════════════════════════════════════

    # ─── VEO 3.1 ────────────────────────────────────────────
    # Best for: cinematic video with native audio
    # Source: https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1
    # JSON prompting is 300%+ more consistent than plain text
    "veo_3_1_t2v": {
        "name": "Google Veo 3.1",
        "category": "video",
        "strengths": ["cinematic", "native_audio", "camera_control", "dialogue", "atmospheric"],
        "prompt_rules": {
            "structure": "JSON (strongly preferred) or natural language",
            "preferred_format": "json",
            "supports_negative": False,
            "supports_json": True,
        },
        "json_template": {
            "scene": "[Detailed scene: environment, mood, atmosphere, time of day]",
            "subject": "[Main character/object: appearance, clothing, expression]",
            "action": "[What happens: movement, gesture, interaction]",
            "camera": {
                "type": "[Camera: Arri Alexa Mini, RED, Sony FX6, etc.]",
                "movement": "[dolly in/out, pan L/R, tilt up/down, crane, steadicam, handheld, static]",
                "angle": "[low angle, eye level, high angle, dutch angle, bird's eye]",
                "lens": "[wide 24mm, normal 50mm, telephoto 85mm, macro]",
                "focus": "[shallow DOF, deep focus, rack focus to subject]",
            },
            "lighting": {
                "type": "[natural, studio, practical, mixed, available light]",
                "mood": "[warm golden, cool blue, dramatic, soft diffused, contrasty]",
                "direction": "[key from left/right/above, fill, backlight, rim light]",
                "time": "[golden hour, blue hour, midday, overcast, night]",
            },
            "audio": {
                "ambient": "[city hum, birdsong, wind, rain, silence]",
                "music": "[minimal piano, orchestral, electronic, none]",
                "sfx": "[footsteps, paper rustle, glass clink, specific sounds]",
                "dialogue": "[Speaking to camera: 'exact words' — or none]",
            },
            "style": "[cinematic, documentary, commercial, music video, editorial]",
            "color_grade": "[warm earth tones, teal and orange, desaturated, high contrast]",
            "technical": "No subtitles, no text overlay, no watermark",
        },
        "tips": [
            "JSON prompting gives 300%+ better consistency than plain text",
            "Front-load intent — core shot and subject before details",
            "Keep scenes atomic — one clear action per clip",
            "Always include audio layer for richest output",
            "Start at 4s/720p for iteration, scale up for final production",
            "End with 'No subtitles, no text overlay' to keep clean",
        ],
    },

    "veo_3_1_extend": {
        "name": "Google Veo 3.1 (Extend)",
        "category": "video",
        "inherits": "veo_3_1_t2v",
    },

    # ─── KLING 3.0 / O3 ────────────────────────────────────
    "kling_3_i2v": {
        "name": "Kling 3.0 Pro (I2V)",
        "category": "video",
        "strengths": ["cinematic_i2v", "motion_quality", "native_audio", "10s_duration"],
        "prompt_rules": {
            "structure": "Camera movement + action + lighting + style",
            "supports_negative": True,
            "supports_json": False,
            "negative_default": "blur, distort, low quality, watermark, text overlay, static image",
        },
        "quality_suffix": "cinematic quality, smooth natural motion, professional production",
    },
    "kling_o3_i2v": {"inherits": "kling_3_i2v", "name": "Kling O3 Pro (I2V)"},
    "kling_o3_t2v": {"inherits": "kling_3_i2v", "name": "Kling O3 Pro (T2V)"},

    # ─── MINIMAX HAILUO ─────────────────────────────────────
    "minimax_i2v": {
        "name": "MiniMax Hailuo 2.3 Pro (I2V)",
        "category": "video",
        "strengths": ["1080p", "reliable", "prompt_optimizer_builtin"],
        "prompt_rules": {
            "structure": "Natural language, concise description",
            "supports_negative": False,
            "supports_json": False,
            "has_prompt_optimizer": True,
        },
        "quality_suffix": "smooth motion, cinematic quality",
    },
    "minimax_fast_i2v": {"inherits": "minimax_i2v", "name": "MiniMax Hailuo Fast (I2V)"},
    "minimax_t2v": {"inherits": "minimax_i2v", "name": "MiniMax Hailuo 2.3 Pro (T2V)"},

    # ─── LUMA RAY 2 ─────────────────────────────────────────
    "luma_i2v": {
        "name": "Luma Ray 2 (I2V)",
        "category": "video",
        "strengths": ["fast", "affordable", "good_for_drafts"],
        "prompt_rules": {
            "structure": "Natural language, simple and direct",
            "supports_negative": False,
            "supports_json": False,
        },
        "quality_suffix": "smooth animation, clear motion",
    },
    "luma_t2v": {"inherits": "luma_i2v", "name": "Luma Ray 2 (T2V)"},
}


# ═══════════════════════════════════════════════════════════════
# PROMPT OPTIMIZER — Core Intelligence of V3
# ═══════════════════════════════════════════════════════════════

class PromptOptimizer:
    """Transforms creative concept descriptions into model-optimized prompts.

    The creative personas (Hopkins, Ogilvy, etc.) write advertising-quality
    descriptions. This optimizer restructures them into technically optimal
    prompts for each specific fal.ai model.
    """

    def optimize(
        self,
        concept: Dict[str, Any],
        model_key: str,
    ) -> str:
        """Optimize a concept's prompt for a specific fal.ai model.

        Args:
            concept: Dict with keys:
                - prompt: Original creative prompt (image_prompt or video_prompt)
                - visual_direction: Visual style notes from the creative
                - color_mood: Color/mood description
                - headline: Campaign headline
                - tagline: Campaign tagline
                - idea: Core concept idea
                - persona_name: Who wrote this concept
            model_key: fal.ai model key (e.g., 'flux_2_pro', 'veo_3_1_t2v')

        Returns:
            Optimized prompt string (or JSON string for Veo 3.1)
        """
        strategy = self._resolve_strategy(model_key)
        if not strategy:
            return concept.get("prompt", "")

        raw_prompt = concept.get("prompt", "") or ""
        visual = concept.get("visual_direction", "") or ""
        color_mood = concept.get("color_mood", "") or ""
        headline = concept.get("headline", "") or ""

        category = strategy.get("category", "image")
        preferred_format = strategy.get("prompt_rules", {}).get("preferred_format", "")

        if preferred_format == "json":
            return self._build_json_prompt(concept, strategy)
        elif category == "video":
            return self._build_video_prompt(raw_prompt, visual, color_mood, strategy)
        elif strategy.get("prompt_rules", {}).get("text_in_quotes"):
            return self._build_typography_prompt(raw_prompt, visual, headline, strategy)
        else:
            return self._build_image_prompt(raw_prompt, visual, color_mood, headline, strategy)

    def _resolve_strategy(self, model_key: str) -> Optional[Dict]:
        """Resolve a strategy, following inheritance chains."""
        strategy = MODEL_STRATEGIES.get(model_key)
        if not strategy:
            return None
        if "inherits" in strategy:
            parent = MODEL_STRATEGIES.get(strategy["inherits"], {})
            return {**parent, **{k: v for k, v in strategy.items() if k != "inherits"}}
        return strategy

    # ─── IMAGE PROMPT BUILDER ───────────────────────────────

    def _build_image_prompt(self, prompt, visual, color_mood, headline, strategy):
        """Build optimized prompt for image models (Flux, Seedream, Recraft, etc.)."""
        parts = []

        # 1. SUBJECT — always first (all models weight early words more)
        if prompt:
            clean = self._clean_advertising_language(prompt)
            parts.append(clean)

        # 2. VISUAL ENRICHMENT
        if visual and len(visual.strip()) > 10:
            clean_visual = self._clean_advertising_language(visual)
            parts.append(clean_visual)

        # 3. STYLE DETECTION — match concept to model's style vocabulary
        combined_text = f"{prompt} {visual} {color_mood}".lower()
        style_keywords = self._detect_best_style(combined_text, strategy.get("style_map", {}))
        if style_keywords:
            parts.append(style_keywords)

        # 4. CAMERA SUGGESTION (Flux models only)
        if "camera_map" in strategy:
            camera = self._suggest_camera(combined_text, strategy["camera_map"])
            if camera:
                parts.append(camera)

        # 5. COLOR MOOD
        if color_mood and len(color_mood.strip()) > 5:
            parts.append(color_mood.strip().rstrip('.'))

        # 6. QUALITY SUFFIX
        quality = strategy.get("quality_suffix", "professional quality")
        parts.append(quality)

        result = ", ".join(p for p in parts if p)

        # Enforce length limit for Seedream (30-100 words)
        limits = strategy.get("prompt_rules", {}).get("optimal_length_words")
        if limits:
            words = result.split()
            if len(words) > limits[1]:
                result = " ".join(words[:limits[1]])

        return result

    # ─── TYPOGRAPHY PROMPT BUILDER ──────────────────────────

    def _build_typography_prompt(self, prompt, visual, headline, strategy):
        """Build optimized prompt for Ideogram V3 (typography-focused)."""
        parts = []

        # Headline in quotes is CRITICAL for Ideogram
        if headline:
            parts.append(f'The text "{headline}" displayed prominently in bold lettering')

        if prompt:
            parts.append(self._clean_advertising_language(prompt))
        if visual:
            parts.append(visual.strip().rstrip('.'))

        quality = strategy.get("quality_suffix", "clean typography, professional layout")
        parts.append(quality)

        return ", ".join(p for p in parts if p)

    # ─── VIDEO PROMPT BUILDER ───────────────────────────────

    def _build_video_prompt(self, prompt, visual, color_mood, strategy):
        """Build optimized prompt for non-JSON video models (Kling, MiniMax, Luma)."""
        parts = []

        # Camera movement first for video
        camera_move = self._extract_camera_movement(prompt)
        if camera_move:
            parts.append(camera_move)

        if prompt:
            parts.append(self._clean_advertising_language(prompt))
        if visual and len(visual.strip()) > 10:
            parts.append(visual.strip().rstrip('.'))
        if color_mood:
            parts.append(color_mood.strip().rstrip('.'))

        quality = strategy.get("quality_suffix", "cinematic quality, smooth motion")
        parts.append(quality)

        return ", ".join(p for p in parts if p)

    # ─── JSON PROMPT BUILDER (VEO 3.1) ─────────────────────

    def _build_json_prompt(self, concept, strategy):
        """Build JSON cinematic prompt for Veo 3.1."""
        prompt = concept.get("prompt", "") or ""
        visual = concept.get("visual_direction", "") or ""
        color_mood = concept.get("color_mood", "") or ""

        # Build scene description from all available concept data
        scene_parts = [prompt]
        if visual:
            scene_parts.append(visual)
        scene = ". ".join(p.strip().rstrip('.') for p in scene_parts if p.strip())

        # Detect environment for ambient audio
        ambient = self._detect_ambient_audio(prompt + " " + visual)
        camera_move = self._extract_camera_movement(prompt)

        json_prompt = {
            "scene": scene,
            "camera": {
                "movement": camera_move or "slow cinematic tracking shot",
                "angle": "eye level",
                "lens": "50mm",
                "focus": "subject in sharp focus, soft background",
            },
            "lighting": {
                "mood": color_mood if color_mood else "natural, warm cinematic tones",
                "type": "mixed natural and practical lighting",
                "direction": "key light from upper-left, soft fill",
            },
            "audio": {
                "ambient": ambient,
                "music": "subtle atmospheric score, understated",
                "sfx": "contextual environmental sounds",
            },
            "style": "cinematic commercial, high production value, premium feel",
            "color_grade": color_mood if color_mood else "rich balanced tones, slight warmth",
            "technical": "No subtitles, no text overlay, no watermark",
        }

        return json.dumps(json_prompt, indent=2)

    # ─── UTILITY METHODS ────────────────────────────────────

    def _clean_advertising_language(self, text: str) -> str:
        """Remove abstract advertising language that confuses image models.

        Advertising creatives write things like 'suggesting trust' or
        'evoking a sense of possibility'. Image models need concrete visuals.
        """
        # Remove abstract concepts that don't translate to visuals
        abstract_phrases = [
            r'\bsuggesting\s+\w+\b', r'\bevoking\s+\w+\b', r'\bsymbolizing\s+\w+\b',
            r'\brepresenting\s+\w+\b', r'\bmetaphor\s+for\b', r'\bthat\s+speaks\s+to\b',
            r'\bconnecting\s+with\b', r'\bresonating\s+with\b',
        ]
        result = text
        for pattern in abstract_phrases:
            result = re.sub(pattern, '', result, flags=re.IGNORECASE)

        # Clean up whitespace
        result = re.sub(r'\s+', ' ', result).strip().rstrip('.')
        return result

    def _detect_best_style(self, text: str, style_map: Dict[str, str]) -> Optional[str]:
        """Detect the best matching style from the strategy's style map."""
        text = text.lower()
        best_match = None
        best_score = 0

        for key, value in style_map.items():
            keywords = key.replace('_', ' ').split()
            score = sum(1 for kw in keywords if kw in text)
            if score > best_score:
                best_score = score
                best_match = value

        return best_match if best_score > 0 else None

    def _suggest_camera(self, text: str, camera_map: Dict[str, str]) -> Optional[str]:
        """Suggest camera settings based on content analysis."""
        text = text.lower()
        if any(kw in text for kw in ["portrait", "face", "person", "people", "model", "headshot"]):
            return camera_map.get("portrait")
        elif any(kw in text for kw in ["product", "packaging", "bottle", "device", "gadget", "object"]):
            return camera_map.get("product")
        elif any(kw in text for kw in ["landscape", "city", "skyline", "wide", "panoram", "building"]):
            return camera_map.get("wide")
        elif any(kw in text for kw in ["cinematic", "film", "dramatic", "scene", "story", "narrative"]):
            return camera_map.get("cinematic")
        elif any(kw in text for kw in ["documentary", "real", "authentic", "candid", "street"]):
            return camera_map.get("documentary")
        return None

    def _extract_camera_movement(self, text: str) -> Optional[str]:
        """Extract or suggest camera movement for video from concept text."""
        text = text.lower()
        if any(kw in text for kw in ["reveal", "discover", "approach", "enter"]):
            return "slow dolly forward, gradually revealing the scene"
        elif any(kw in text for kw in ["panorama", "landscape", "wide", "sweep"]):
            return "slow panoramic pan from left to right"
        elif any(kw in text for kw in ["rise", "ascend", "grow", "elevate", "soar"]):
            return "gentle crane up, rising perspective"
        elif any(kw in text for kw in ["detail", "close", "texture", "intimate", "focus"]):
            return "subtle push in, closing on detail"
        elif any(kw in text for kw in ["dynamic", "energy", "action", "bold"]):
            return "handheld tracking, energetic movement"
        elif any(kw in text for kw in ["calm", "peaceful", "serene", "still"]):
            return "static wide shot, minimal movement"
        return "slow cinematic tracking shot"

    def _detect_ambient_audio(self, text: str) -> str:
        """Detect appropriate ambient audio from concept text."""
        text = text.lower()
        if any(kw in text for kw in ["city", "urban", "street", "downtown", "metro"]):
            return "distant city ambience, traffic hum, footsteps"
        elif any(kw in text for kw in ["nature", "forest", "garden", "park", "outdoor", "green"]):
            return "birdsong, gentle wind through leaves, natural ambience"
        elif any(kw in text for kw in ["ocean", "beach", "sea", "coast", "wave"]):
            return "ocean waves, seagulls, coastal wind"
        elif any(kw in text for kw in ["office", "corporate", "business", "meeting", "workspace"]):
            return "quiet office ambience, subtle air conditioning, distant keyboard"
        elif any(kw in text for kw in ["luxury", "premium", "elegant", "refined", "exclusive"]):
            return "refined quiet, subtle room tone, elegant ambience"
        elif any(kw in text for kw in ["factory", "industrial", "workshop", "craft"]):
            return "workshop ambience, subtle mechanical sounds"
        elif any(kw in text for kw in ["night", "evening", "dark", "moonlight"]):
            return "night ambience, distant sounds, quiet atmosphere"
        return "ambient atmospheric sounds"


# ═══════════════════════════════════════════════════════════════
# CONVENIENCE — Quick access for other modules
# ═══════════════════════════════════════════════════════════════

# Singleton for import convenience
_optimizer = PromptOptimizer()


def optimize_prompt(concept: Dict[str, Any], model_key: str) -> str:
    """Quick access: optimize a prompt for a model."""
    return _optimizer.optimize(concept, model_key)


def get_strategy(model_key: str) -> Optional[Dict]:
    """Get the prompt strategy for a model (resolved with inheritance)."""
    return _optimizer._resolve_strategy(model_key)


def get_all_strategies() -> Dict[str, Dict]:
    """Return all model strategies (for API/UI consumption)."""
    return MODEL_STRATEGIES
