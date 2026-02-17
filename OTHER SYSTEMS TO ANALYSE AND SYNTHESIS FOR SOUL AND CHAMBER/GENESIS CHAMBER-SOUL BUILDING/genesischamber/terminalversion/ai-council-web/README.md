# AI Expert Council Simulator - Web UI

A sophisticated web front-end for the AI Expert Council Simulator that allows users to submit business problems and watch simulated debates between AI experts unfold in real-time.

## Design Features

- **Minimalist Premium Design**: Pitch-black background with vibrant orange accents
- **Real-time Streaming**: Word-by-word text animation with pulsing orange caret
- **Clean Typography**: Inter font with high contrast for readability
- **No Chat Bubbles**: Clean text blocks directly on black background
- **Sequential Expert Appearance**: Each expert appears one at a time

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Backend**: FastAPI with WebSocket support
- **Styling**: Pure black background, orange-500 accents, gray-300 text

## Project Structure

```
ai-council-web/
├── backend/
│   ├── main.py              # FastAPI server with WebSocket endpoints
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Utilities (WebSocket handler)
│   └── types/               # TypeScript type definitions
└── README.md
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

- `POST /api/start-debate`: Initialize a new debate session
- `WebSocket /ws/debate/{debate_id}`: Stream debate updates in real-time

## WebSocket Message Types

- `expert_turn`: Signals the start of a new expert's response
- `text_chunk`: Contains a chunk of text to be streamed
- `debate_complete`: Signals the end of the debate
- `final_analysis`: Contains the final analysis and recommendations

## Key Components

- **InputSection**: Problem input form with fade-out animation
- **DebateTranscript**: Main debate display with WebSocket connection
- **ExpertTurn**: Individual expert message with streaming effect
- **FinalAnalysis**: Structured display of insights and action items

## Customization

To modify the simulated expert responses, edit the `expert_responses` array in `backend/main.py`. The debate simulation timing can be adjusted by modifying the `asyncio.sleep()` values.