"""OpenRouter API client for making LLM requests."""

import httpx
from typing import List, Dict, Any, Optional
from .config import OPENROUTER_API_KEY, OPENROUTER_API_URL


def _extract_response(message: Dict[str, Any]) -> Dict[str, Any]:
    """Extract content, reasoning, and annotations from an OpenRouter response message."""
    return {
        'content': message.get('content'),
        'reasoning': message.get('reasoning'),
        'reasoning_details': message.get('reasoning_details'),
        'annotations': message.get('annotations'),
    }


def get_reasoning_config(model: str, thinking_mode: str = "thinking") -> Dict[str, Any]:
    """Get the appropriate reasoning config for a model and thinking tier.

    Tiers:
      - "off": no reasoning (returns empty dict)
      - "thinking": standard extended reasoning
      - "deep": maximum reasoning with higher budgets

    Models:
      - Claude 4.6 (Opus/Sonnet): adaptive thinking (no budget, most powerful)
      - Claude 4.5 (Opus/Sonnet): effort-based high
      - GPT-5.2 / GPT-5.1: effort-based high (OpenAI reasoning)
      - Gemini 3 Pro / 2.5 Pro: effort-based high (Google thinking)
      - Grok 4: effort-based high (xAI reasoning + native X.com search)
      - Others: effort-based medium
    """
    if thinking_mode == "off":
        return {}

    model_lower = model.lower()
    # Claude 4.6 — adaptive thinking (most powerful, no budget needed)
    if any(s in model_lower for s in ('claude-opus-4.6', 'claude-sonnet-4.6',
                                       'claude-opus-4-6', 'claude-sonnet-4-6')):
        return {"exclude": False}
    # Claude 4.5 — effort high; deep mode adds explicit budget
    elif any(s in model_lower for s in ('claude-opus-4.5', 'claude-sonnet-4.5',
                                         'claude-opus-4-5', 'claude-sonnet-4-5')):
        config = {"effort": "high", "exclude": False}
        if thinking_mode == "deep":
            config["max_tokens"] = 32000
        return config
    # GPT-5.x — effort high
    elif any(s in model_lower for s in ('gpt-5.2', 'gpt-5.1', 'gpt-5')):
        return {"effort": "high", "exclude": False}
    # Gemini — effort high
    elif any(s in model_lower for s in ('gemini-3', 'gemini-2.5-pro')):
        return {"effort": "high", "exclude": False}
    # Grok — effort high
    elif 'grok-4' in model_lower or 'grok-3' in model_lower:
        return {"effort": "high", "exclude": False}
    else:
        effort = "high" if thinking_mode == "deep" else "medium"
        return {"effort": effort, "exclude": False}


async def query_model(
    model: str,
    messages: List[Dict[str, str]],
    timeout: float = 120.0,
    reasoning: Optional[Dict[str, Any]] = None,
    plugins: Optional[List[Dict[str, Any]]] = None,
) -> Optional[Dict[str, Any]]:
    """
    Query a single model via OpenRouter API.

    Args:
        model: OpenRouter model identifier (e.g., "openai/gpt-4o")
        messages: List of message dicts with 'role' and 'content'
        timeout: Request timeout in seconds
        reasoning: Optional reasoning config (e.g., {"exclude": False})
        plugins: Optional plugins list (e.g., [{"id": "web", "max_results": 5}])

    Returns:
        Response dict with 'content', 'reasoning', 'reasoning_details', 'annotations', or None if failed
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "messages": messages,
    }
    if reasoning:
        payload["reasoning"] = reasoning
        payload["max_tokens"] = 16000
    if plugins:
        payload["plugins"] = plugins

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                OPENROUTER_API_URL,
                headers=headers,
                json=payload
            )
            response.raise_for_status()

            data = response.json()
            message = data['choices'][0]['message']
            return _extract_response(message)

    except Exception as e:
        print(f"Error querying model {model}: {e}")
        return None


async def query_models_parallel(
    models: List[str],
    messages: List[Dict[str, str]],
    reasoning: Optional[Dict[str, Any]] = None,
    plugins: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Optional[Dict[str, Any]]]:
    """
    Query multiple models in parallel.

    Args:
        models: List of OpenRouter model identifiers
        messages: List of message dicts to send to each model
        reasoning: Optional reasoning config applied to all models
        plugins: Optional plugins list applied to all models

    Returns:
        Dict mapping model identifier to response dict (or None if failed)
    """
    import asyncio

    tasks = [query_model(model, messages, reasoning=reasoning, plugins=plugins) for model in models]
    responses = await asyncio.gather(*tasks)
    return {model: response for model, response in zip(models, responses)}


# --- Genesis Chamber additions ---

async def query_with_soul(
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.7,
    max_tokens: int = 2000,
    timeout: float = 180.0,
    reasoning: Optional[Dict[str, Any]] = None,
    plugins: Optional[List[Dict[str, Any]]] = None,
    thinking_mode: str = "off",
) -> Optional[Dict[str, Any]]:
    """
    Query a model with a system prompt for soul injection.

    Args:
        model: OpenRouter model identifier
        system_prompt: System prompt containing soul document + task
        user_prompt: The user-facing prompt (brief, concepts, etc.)
        temperature: Sampling temperature
        max_tokens: Max response tokens
        timeout: Request timeout in seconds (longer for soul-loaded prompts)
        reasoning: Optional reasoning config for extended thinking
        plugins: Optional plugins list for web search etc.
        thinking_mode: "off", "thinking", or "deep" — controls token budget scaling

    Returns:
        Response dict with 'content', 'reasoning', 'reasoning_details', 'annotations', or None
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    # Scale max_tokens based on thinking mode
    effective_max_tokens = max_tokens
    if thinking_mode == "deep" and reasoning:
        effective_max_tokens = min(max(max_tokens * 3, 16000), 32000)
    elif reasoning:
        effective_max_tokens = min(max(max_tokens * 2, 8000), 16000)

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": effective_max_tokens,
    }
    if reasoning:
        payload["reasoning"] = reasoning
    if plugins:
        payload["plugins"] = plugins

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                OPENROUTER_API_URL,
                headers=headers,
                json=payload
            )
            response.raise_for_status()

            data = response.json()
            message = data['choices'][0]['message']
            return _extract_response(message)

    except Exception as e:
        print(f"Error querying model {model} (soul): {e}")
        return None


async def query_with_soul_parallel(
    queries: List[Dict[str, Any]]
) -> List[Optional[Dict[str, Any]]]:
    """
    Query multiple models in parallel, each with its own system prompt.

    Args:
        queries: List of dicts with keys: model, system_prompt, user_prompt, temperature, max_tokens,
                 and optional: reasoning, plugins, thinking_mode

    Returns:
        List of response dicts (or None for failures), in same order as queries
    """
    import asyncio

    tasks = [
        query_with_soul(
            model=q["model"],
            system_prompt=q["system_prompt"],
            user_prompt=q["user_prompt"],
            temperature=q.get("temperature", 0.7),
            max_tokens=q.get("max_tokens", 2000),
            reasoning=q.get("reasoning"),
            plugins=q.get("plugins"),
            thinking_mode=q.get("thinking_mode", "off"),
        )
        for q in queries
    ]

    return await asyncio.gather(*tasks)
