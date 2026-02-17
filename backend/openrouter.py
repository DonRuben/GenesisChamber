"""OpenRouter API client for making LLM requests."""

import httpx
from typing import List, Dict, Any, Optional
from .config import OPENROUTER_API_KEY, OPENROUTER_API_URL


async def query_model(
    model: str,
    messages: List[Dict[str, str]],
    timeout: float = 120.0
) -> Optional[Dict[str, Any]]:
    """
    Query a single model via OpenRouter API.

    Args:
        model: OpenRouter model identifier (e.g., "openai/gpt-4o")
        messages: List of message dicts with 'role' and 'content'
        timeout: Request timeout in seconds

    Returns:
        Response dict with 'content' and optional 'reasoning_details', or None if failed
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "messages": messages,
    }

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

            return {
                'content': message.get('content'),
                'reasoning_details': message.get('reasoning_details')
            }

    except Exception as e:
        print(f"Error querying model {model}: {e}")
        return None


async def query_models_parallel(
    models: List[str],
    messages: List[Dict[str, str]]
) -> Dict[str, Optional[Dict[str, Any]]]:
    """
    Query multiple models in parallel.

    Args:
        models: List of OpenRouter model identifiers
        messages: List of message dicts to send to each model

    Returns:
        Dict mapping model identifier to response dict (or None if failed)
    """
    import asyncio

    # Create tasks for all models
    tasks = [query_model(model, messages) for model in models]

    # Wait for all to complete
    responses = await asyncio.gather(*tasks)

    # Map models to their responses
    return {model: response for model, response in zip(models, responses)}


# --- Genesis Chamber additions ---

async def query_with_soul(
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.7,
    max_tokens: int = 2000,
    timeout: float = 180.0
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

    Returns:
        Response dict with 'content' and optional 'reasoning_details', or None
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

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

            return {
                'content': message.get('content'),
                'reasoning_details': message.get('reasoning_details')
            }

    except Exception as e:
        print(f"Error querying model {model} (soul): {e}")
        return None


async def query_with_soul_parallel(
    queries: List[Dict[str, Any]]
) -> List[Optional[Dict[str, Any]]]:
    """
    Query multiple models in parallel, each with its own system prompt.

    Args:
        queries: List of dicts with keys: model, system_prompt, user_prompt, temperature, max_tokens

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
        )
        for q in queries
    ]

    return await asyncio.gather(*tasks)
