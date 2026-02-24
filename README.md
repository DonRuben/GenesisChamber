# Genesis Chamber V4

<p align="center">
  <img src="header.png" width="100%" alt="Genesis Chamber V4 — 19 AI Personas, One Creative Council">
</p>

> **19 legendary minds. One creative council. Zero groupthink.**

A multi-persona AI creative simulation engine. Genesis Chamber orchestrates 5–19 AI participants — each loaded with deep consciousness profiles ("soul documents", ~500KB per persona) — through iterative debate rounds to produce creative concepts, critique them anonymously, and refine them to production quality.

Evolved from Karpathy's [llm-council](https://github.com/karpathy/llm-council). The original council mode is fully preserved.

---

## Two Modes, One Platform

### 🔮 Genesis Chamber Mode (Full Simulation)

<p align="center">
  <img src="genesis-pipeline.png" width="100%" alt="Genesis Chamber 6-round simulation pipeline">
</p>

The flagship creative engine. 19 soul-loaded personas compete through up to 6 rounds of structured creative evolution:

```
Brief + Souls → Round 1: DIVERGE → Round 2: CONVERGE → Round 3: DEEPEN
  → [Quality Gate] → Round 4: GLADIATOR → Round 5: POLISH → Round 6: SPEC
  → Output Engine → Presentations, Images, Videos
```

**5 stages per round:** CREATE → CRITIQUE (anonymized) → SYNTHESIZE → REFINE → PRESENT

**Quality Gates** let you review concepts between rounds and approve or redirect the creative direction — human-in-the-loop control over AI-driven creativity.

**Output:** Reveal.js presentations, fal.ai image generation, fal.ai video generation (hero/standard/draft tiers), interactive transcripts.

### ⚡ Council Mode (Classic LLM Council)

<p align="center">
  <img src="council-mode.png" width="100%" alt="Classic 3-stage LLM Council mode">
</p>

The original Karpathy llm-council, upgraded with 19 personas and SSE streaming. Toggle to "Council" mode in the sidebar for the classic 3-stage flow:

1. **Stage 1 — First Opinions:** All personas answer independently
2. **Stage 2 — Review:** Anonymized cross-ranking with scores
3. **Stage 3 — Final Response:** Chairman synthesizes the definitive answer

---

## The 19 Personas

| Team | Personas | Role |
|------|----------|------|
| **🔥 Marketing** (5) | David Ogilvy, Claude Hopkins, Leo Burnett, Mary Wells Lawrence, Gary Halbert | Strategy & copy |
| **💎 Design** (6) | Paul Rand, Paula Scher, Saul Bass, Susan Kare, Rob Janoff, Tobias van Schneider | Visual & brand |
| **💰 Business** (5) | Elon Musk, Jeff Bezos, Warren Buffett, Richard Branson, Dietrich Mateschitz | Commercial viability |
| **👑 Leadership** (2) | Steve Jobs (Moderator), Jony Ive (Evaluator) | Orchestration |
| **🔴 Special** (1) | Devil's Advocate (Promoter of the Faith) | Stress-testing |

Each persona is backed by a rich soul document in `souls/` — deep personality profiles covering biography, creative philosophy, decision-making patterns, communication style, and historical context. These compile into LLM system prompts that produce genuinely distinct creative voices.

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- [OpenRouter API key](https://openrouter.ai/) (required)
- [fal.ai API key](https://fal.ai/) (optional, for image/video generation)

### 1. Clone & Install

```bash
git clone https://github.com/DonRuben/GenesisChamber.git
cd GenesisChamber

# Backend
pip install -r requirements.txt
# OR with uv:
uv sync

# Frontend
cd frontend
npm install
cd ..
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env`:
```
OPENROUTER_API_KEY=your-openrouter-api-key
FAL_KEY=your-fal-key-here
```

### 3. Run

**One command (recommended):**
```bash
chmod +x start.sh
./start.sh
```

**Or manually (two terminals):**

```bash
# Terminal 1 — Backend
python -m backend.main

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### 4. Open

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8001
- **Swagger Docs:** http://localhost:8001/docs

---

## Running a Simulation

1. Open http://localhost:5173
2. You're in **Genesis Chamber** mode by default (toggle to "Council" for classic mode)
3. Click **New Simulation**
4. Choose a preset:

| Preset | Rounds | Stages | Participants | Time | Est. Cost |
|--------|--------|--------|-------------|------|-----------|
| **Quick Test** | 3 | 3 | 5 | ~5 min | ~$2 |
| **Message Lab** | 6 | 5 | 7 | ~30 min | ~$15 |
| **Genesis Chamber** | 6 | 5 | 13 | ~2 hrs | ~$50 |

5. Enter your creative brief (or use the example)
6. Click **Start** — watch rounds progress in real-time via SSE
7. At **Quality Gates**, review concepts and approve or redirect
8. When complete, generate outputs:
   - **Download Presentation** — Reveal.js HTML deck
   - **Generate Images** — fal.ai concept visualization
   - **Generate Videos** — fal.ai video (hero/standard/draft quality tiers)

---

## Project Structure

```
GenesisChamber/
├── src/                          # React 19 + Vite + Zustand (port 5173)
│   ├── components/               # UI components (inline styles via useTokens())
│   ├── stores/                   # councilStore.js, appStore.js (Zustand)
│   ├── data/                     # soulBios.js, mock.js, presets
│   ├── design/                   # tokens.js, shared.jsx, icons.jsx, gc-motion.css
│   └── hooks/                    # useTokens, useMediaQuery, useSwipe
├── backend/                      # Python FastAPI (port 8001)
│   ├── main.py                   # App entry, CORS, 28 routes
│   ├── simulation.py             # 5-stage simulation engine
│   ├── soul_engine.py            # Soul document loader
│   ├── council.py                # Original llm-council (preserved)
│   ├── config.py                 # 19 personas, presets, model assignments
│   ├── openrouter_client.py      # OpenRouter API client + streaming
│   ├── output_engine.py          # Presentations, transcripts
│   ├── image_generator.py        # fal.ai image generation
│   ├── video_generator.py        # fal.ai video generation
│   ├── routes.py                 # API endpoint definitions
│   ├── sse.py                    # Server-Sent Events implementation
│   ├── database.py               # Neon PostgreSQL (async SQLAlchemy)
│   ├── models.py                 # SQLAlchemy ORM + Pydantic schemas
│   ├── storage.py                # DB CRUD + JSON state persistence
│   ├── simulation_store.py       # In-memory simulation state
│   ├── middleware.py              # Request/response logging
│   ├── validators.py             # Input validation
│   ├── exceptions.py             # Custom exception handlers
│   └── utils.py                  # Shared helpers
├── souls/                        # 19 soul documents (~500KB total)
├── briefs/                       # Creative brief templates
├── docs/                         # Specs + design references
│   └── phase9-final-spec.md      # Phase 9 spec
├── tests/                        # Pipeline tests
├── .env.example                  # Environment variable template
├── start.sh                      # One-command local startup
├── Dockerfile                    # Backend container
├── Dockerfile.frontend           # Frontend container (nginx)
├── docker-compose.yml            # Full stack Docker
├── render.yaml                   # Render.com deployment blueprint
├── CLAUDE.md                     # AI agent technical instructions
└── README.md                     # ← You are here
```

---

## Deployment

### Option 1: Docker (Self-Hosted)

```bash
docker-compose up --build
# Frontend: http://localhost:8080
# Backend:  http://localhost:8001
```

### Option 2: Vercel + Render

**Backend on Render:**
1. Connect your GitHub repo to [render.com](https://render.com)
2. Use the `render.yaml` blueprint
3. Add env vars: `OPENROUTER_API_KEY`, `FAL_KEY`, `ALLOWED_ORIGINS`

**Frontend on Vercel:**
1. Import on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add env var: `VITE_API_URL=https://your-render-backend.onrender.com`

### Option 3: Manual VPS

```bash
# Backend
pip install -r requirements.txt
PORT=8001 ALLOWED_ORIGINS=https://yourdomain.com python -m backend.main

# Frontend
cd frontend
VITE_API_URL=https://api.yourdomain.com npm run build
# Serve dist/ with nginx
```

---

## API Reference

Full Swagger documentation at `http://localhost:8001/docs`.

### Simulation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/souls` | List available soul personas |
| GET | `/api/simulation/presets` | List simulation presets |
| POST | `/api/simulation/start` | Start a simulation |
| POST | `/api/simulation/start/stream` | Start with SSE streaming |
| GET | `/api/simulation/{id}/status` | Get simulation status |
| GET | `/api/simulation/{id}/state` | Get full simulation state |
| POST | `/api/simulation/{id}/gate/{round}/approve` | Approve quality gate |
| GET | `/api/simulation/{id}/transcript` | Get full transcript |
| GET | `/api/simulation/{id}/presentation` | Download Reveal.js deck |
| POST | `/api/simulation/{id}/generate-images` | Generate concept images |
| POST | `/api/simulation/{id}/generate-videos` | Generate concept videos |
| GET | `/api/simulation/{id}/video-tiers` | Get video quality tiers |

### Council Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/simulate` | Start council simulation |
| GET | `/api/stream` | SSE stream for real-time updates |
| GET | `/api/status` | Check council status |
| GET | `/api/simulations` | List past simulations |
| GET | `/api/simulations/{id}` | Get simulation details |

### SSE Event Schema

```
response_start    → { soul_id, stage, model }
response_chunk    → { soul_id, chunk, accumulated }
response_complete → { soul_id, full_response, tokens_used }
stage_complete    → { stage, summary, next_stage }
simulation_done   → { results, winner, media_urls }
error             → { message, code }
```

---

## Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│ SOUL ENGINE │ ──→ │ SIMULATION      │ ──→ │ OUTPUT       │
│ Load 19     │     │ ENGINE          │     │ ENGINE       │
│ personality │     │ 6 rounds ×      │     │ Reveal.js    │
│ profiles    │     │ 5 stages each   │     │ fal.ai imgs  │
│ from souls/ │     │ + Quality Gates │     │ fal.ai video │
└─────────────┘     └─────────────────┘     │ Transcripts  │
                                            └──────────────┘
```

For technical implementation details, see `CLAUDE.md`. For backend-specific docs (engines, DB schema, middleware), see `backend/CLAUDE.md`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for LLM access |
| `FAL_KEY` | No | fal.ai key for image/video generation |
| `ELEVENLABS_API_KEY` | No | ElevenLabs key for voice (future) |
| `DATABASE_URL` | No | Neon PostgreSQL connection string |
| `PORT` | No | Backend port (default: 8001) |
| `ALLOWED_ORIGINS` | No | CORS origins, comma-separated |
| `VITE_API_URL` | No | Frontend → backend URL (default: http://localhost:8001) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Zustand, inline styles via useTokens() |
| Backend | FastAPI, Python 3.10+, async httpx, Pydantic v2 |
| LLM Access | OpenRouter (GPT-5.1, Claude Opus 4.6, Gemini 3 Pro, Grok 4, Llama 4) |
| Image Gen | fal.ai (Flux, Recraft, Ideogram, SDXL) |
| Video Gen | fal.ai (Kling 2.6, Minimax Hailuo 2.3, Luma Ray 2) |
| Database | Neon PostgreSQL (async SQLAlchemy) + JSON state persistence |
| Streaming | Server-Sent Events (SSE) |
| Presentations | Reveal.js 5.2.1 (CDN) |
| Hosting | Vercel (frontend) + Render (backend) + Docker (self-hosted) |

---

## Design System

All styling uses inline style objects via the `useTokens()` hook. No Tailwind, no CSS modules.

**Team Colors:** 🔥 Marketing `#F27123` · 💎 Design `#00D9FF` · 💰 Business `#FFB800`

Only three CSS files exist: `gc-motion.css` (animations), `fonts.css` (typefaces), `index.css` (resets).

---

## License

Private — All rights reserved.
