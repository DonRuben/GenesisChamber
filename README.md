# Genesis Chamber

![llmcouncil](header.jpg)

**A multi-persona AI creative simulation engine.** Genesis Chamber orchestrates 5-13 AI participants — each loaded with deep consciousness profiles ("soul documents") — through iterative debate rounds to produce creative concepts, critique them anonymously, and refine them to production quality.

Evolved from Karpathy's [llm-council](https://github.com/karpathy/llm-council). The original council mode is fully preserved.

## What It Does

```
Brief + Souls → Round 1: DIVERGE → Round 2: CONVERGE → Round 3: DEEPEN
  → [Quality Gate] → Round 4: GLADIATOR → Round 5: POLISH → Round 6: SPEC
  → Output Engine → Presentations, Images, Videos
```

**5 stages per round:** CREATE → CRITIQUE (anonymized) → SYNTHESIZE → REFINE → PRESENT

**7 soul-loaded personas:** Ogilvy, Hopkins, Burnett, Halbert, Wells Lawrence, Jobs (moderator), Ive (evaluator)

**Output:** Reveal.js presentations, image generation (fal.ai), video generation (fal.ai), interactive transcripts

---

## Quick Start (Local)

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

### 2. Configure API Keys

```bash
cp .env.example .env
```

Edit `.env`:
```
OPENROUTER_API_KEY=your-openrouter-api-key
FAL_KEY=your-fal-key-here
```

### 3. Run

**Option A — Start script (recommended):**
```bash
chmod +x start.sh
./start.sh
```

**Option B — Manual (two terminals):**

Terminal 1 (Backend):
```bash
python -m backend.main
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 4. Open

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8001
- **API Docs (Swagger):** http://localhost:8001/docs

---

## How to Run a Simulation

1. Open http://localhost:5173
2. You'll be in **Genesis Chamber** mode (toggle to "Council" mode for the original llm-council)
3. Click **New Simulation**
4. Choose a preset:
   - **Quick Test** — 3 rounds, 3 stages, fast (~5 min, ~$2)
   - **Message Lab** — 6 rounds, 5 stages, full pipeline (~30 min, ~$15)
   - **Genesis Chamber** — 6 rounds, 5 stages, 13 participants (~2 hrs, ~$50)
5. Enter your creative brief (or use the example brief)
6. Click **Start**
7. Watch rounds progress in real-time
8. At **Quality Gates**, review concepts and approve/redirect
9. When complete:
   - **Download Presentation** — Reveal.js HTML deck
   - **Generate Images** — fal.ai concept visualization
   - **Generate Videos** — fal.ai video for winners (hero/standard/draft quality)

---

## Project Structure

```
GenesisChamber/
├── backend/                    # Python FastAPI (port 8001)
│   ├── main.py                 # API endpoints (28 routes)
│   ├── simulation.py           # 5-stage simulation engine
│   ├── soul_engine.py          # Soul document loader
│   ├── council.py              # Original llm-council (preserved)
│   ├── config.py               # Models, presets, participants
│   ├── openrouter.py           # OpenRouter API client
│   ├── models.py               # Pydantic schemas
│   ├── output_engine.py        # Presentations, transcripts
│   ├── image_generator.py      # fal.ai image generation
│   ├── video_generator.py      # fal.ai video generation
│   ├── storage.py              # JSON conversation storage
│   └── simulation_store.py     # Simulation state persistence
├── frontend/                   # React + Vite (port 5173)
│   └── src/
│       ├── App.jsx             # Mode switching (council/genesis)
│       ├── api.js              # API client (30+ methods)
│       └── components/         # 13 React components
├── souls/                      # Soul documents (7 personas, ~500KB)
├── briefs/                     # Creative briefs
├── tests/                      # Pipeline tests
├── genesis-chamber-builder/    # Architecture docs & configs
├── .env.example                # Environment variable template
├── start.sh                    # One-command local startup
├── Dockerfile                  # Backend container
├── Dockerfile.frontend         # Frontend container (nginx)
├── docker-compose.yml          # Full stack docker
├── render.yaml                 # Render.com deployment
├── requirements.txt            # Python dependencies
└── pyproject.toml              # Python project config
```

---

## Deployment

### Option 1: Docker (Self-Hosted)

```bash
# Build and run both services
docker-compose up --build

# Frontend: http://localhost:8080
# Backend:  http://localhost:8001
```

### Option 2: Vercel (Frontend) + Render (Backend)

**Backend on Render:**
1. Connect your GitHub repo to [render.com](https://render.com)
2. Use the `render.yaml` blueprint
3. Add environment variables: `OPENROUTER_API_KEY`, `FAL_KEY`, `ALLOWED_ORIGINS`

**Frontend on Vercel:**
1. Import the `frontend/` directory on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-render-backend.onrender.com`

### Option 3: Manual VPS

```bash
# Backend
pip install -r requirements.txt
PORT=8001 ALLOWED_ORIGINS=https://yourdomain.com python -m backend.main

# Frontend (build static files, serve with nginx)
cd frontend
VITE_API_URL=https://api.yourdomain.com npm run build
# Serve dist/ with nginx
```

---

## API Reference

All endpoints are documented at `http://localhost:8001/docs` (Swagger UI).

Key endpoints:

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
| GET | `/api/simulation/{id}/presentation` | Download reveal.js deck |
| POST | `/api/simulation/{id}/generate-images` | Generate concept images |
| POST | `/api/simulation/{id}/generate-videos` | Generate concept videos |
| GET | `/api/simulation/{id}/video-tiers` | Get video quality tiers |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for LLM access |
| `FAL_KEY` | No | fal.ai key for image/video generation |
| `ELEVENLABS_API_KEY` | No | ElevenLabs key for voice (future) |
| `PORT` | No | Backend port (default: 8001) |
| `ALLOWED_ORIGINS` | No | CORS origins, comma-separated |
| `VITE_API_URL` | No | Frontend env — backend URL (default: http://localhost:8001) |

---

## Architecture

```
SOUL ENGINE → COUNCIL ENGINE → OUTPUT ENGINE
(load souls)   (run simulation)   (generate deliverables)
```

See `CLAUDE.md` for technical implementation details and `MASTERPLAN.md` for the full build plan.

---

## Original LLM Council Mode

The original Karpathy llm-council is fully preserved. Toggle to "Council" mode in the sidebar for the classic 3-stage flow:

1. **Stage 1:** All LLMs answer independently
2. **Stage 2:** Anonymized cross-ranking
3. **Stage 3:** Chairman synthesizes final answer

---

## Tech Stack

- **Backend:** FastAPI, Python 3.10+, async httpx, Pydantic v2
- **Frontend:** React 19, Vite 7, react-markdown
- **LLM Access:** OpenRouter (GPT-5.1, Claude Opus 4.6, Gemini 3 Pro, Grok 4, Llama 4)
- **Image Gen:** fal.ai (Flux, Recraft, Ideogram, SDXL)
- **Video Gen:** fal.ai (Kling 2.6, Minimax Hailuo 2.3, Luma Ray 2)
- **Presentations:** Reveal.js 5.2.1 (CDN)
- **Storage:** JSON files (state persistence + resume)
