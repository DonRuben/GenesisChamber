# Backend — FastAPI + OpenRouter

Python FastAPI backend that orchestrates multi-LLM council sessions via OpenRouter API.

## Architecture
- `main.py` — FastAPI app, CORS (middleware BEFORE routes), route definitions
- `council.py` — 3-stage council orchestration, SSE streaming to frontend
- `openrouter.py` — OpenRouter API wrapper, model routing, thinking mode support
- `database.py` — Neon PostgreSQL connection, conversation CRUD

## API Endpoints
```
POST /api/council/run     — Start council session (returns SSE stream)
POST /api/conversations   — Create conversation record
GET  /api/conversations   — List conversations
GET  /api/health          — Health check
```

## OpenRouter Models (19 models, 4 tiers)
- Premium: claude-opus-4-6, gpt-5.2, gpt-5.1, gemini-3-pro
- Balanced: claude-sonnet-4-6, gpt-4.1, gemini-2.5-flash-thinking, deepseek-r1
- Efficient: claude-haiku-4-5, gpt-4.1-mini, gemini-2.5-flash, llama-4-scout
- Budget: gemma-3, phi-4, mistral-small

## Thinking Mode
When thinking is 'think' or 'deep', pass to OpenRouter:
```python
{"type": "enabled", "budget_tokens": 10000}  # think
{"type": "enabled", "budget_tokens": 30000}  # deep
```
When thinking is 'off': omit the thinking parameter entirely. Do NOT pass `budget_tokens: 0`.

## SSE Event Types
```
response_start    — {soul_id, soul_name, model_id}
response_chunk    — {soul_id, chunk}
response_complete — {soul_id, full_text, model_id}
stage_complete    — {stage, stage_number}
title_complete    — {title}
```

## Run
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Deploy
Hosted on Render. Auto-deploys from main branch.
