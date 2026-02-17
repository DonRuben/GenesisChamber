from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List
import json
import asyncio
import uuid
from datetime import datetime

app = FastAPI()

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active debates (in production, use Redis or similar)
active_debates: Dict[str, Dict] = {}
connected_clients: Dict[str, List[WebSocket]] = {}

class StartDebateRequest(BaseModel):
    problem: str

class StartDebateResponse(BaseModel):
    debate_id: str
    status: str

@app.post("/api/start-debate")
async def start_debate(request: StartDebateRequest) -> StartDebateResponse:
    """Initialize a new debate session"""
    debate_id = str(uuid.uuid4())
    
    # Store debate information
    active_debates[debate_id] = {
        "id": debate_id,
        "problem": request.problem,
        "started_at": datetime.utcnow().isoformat(),
        "status": "active",
        "experts": [
            {"name": "Steve", "title": "Startup Founder & Product Visionary"},
            {"name": "Jony", "title": "Chief Design Officer"},
            {"name": "Reid", "title": "Venture Capitalist & Scaling Expert"},
            {"name": "Ginni", "title": "Enterprise Business Strategist"},
            {"name": "Lila", "title": "Chief Marketing Officer"}
        ]
    }
    
    # Start the debate simulation in the background
    asyncio.create_task(simulate_debate(debate_id))
    
    return StartDebateResponse(debate_id=debate_id, status="started")

@app.websocket("/ws/debate/{debate_id}")
async def websocket_endpoint(websocket: WebSocket, debate_id: str):
    """WebSocket endpoint for streaming debate updates"""
    await websocket.accept()
    
    # Add client to connected clients list
    if debate_id not in connected_clients:
        connected_clients[debate_id] = []
    connected_clients[debate_id].append(websocket)
    
    try:
        # Keep connection alive
        while True:
            # Wait for any message from client (mainly for ping/pong)
            await websocket.receive_text()
    except WebSocketDisconnect:
        # Remove client from connected clients
        if debate_id in connected_clients:
            connected_clients[debate_id].remove(websocket)
            if not connected_clients[debate_id]:
                del connected_clients[debate_id]

async def broadcast_to_debate(debate_id: str, message: dict):
    """Broadcast a message to all connected clients for a specific debate"""
    if debate_id in connected_clients:
        disconnected_clients = []
        for websocket in connected_clients[debate_id]:
            try:
                await websocket.send_json(message)
            except:
                disconnected_clients.append(websocket)
        
        # Clean up disconnected clients
        for client in disconnected_clients:
            connected_clients[debate_id].remove(client)

async def simulate_debate(debate_id: str):
    """Simulate a debate with streaming responses"""
    debate = active_debates.get(debate_id)
    if not debate:
        return
    
    # Simulated expert responses
    expert_responses = [
        {
            "expert": "Steve",
            "text": "You're asking about scaling challenges, and I've lived through this multiple times. The key isn't just growing fast - it's maintaining your product vision while you scale. When we grew from 10 to 100 employees, everything broke. Our beautiful, simple product started becoming a Frankenstein monster of features."
        },
        {
            "expert": "Jony",
            "text": "Steve raises an essential point about product complexity. From a design perspective, scaling often means fighting entropy. Every new feature, every new team member, every new process - they all add complexity. The challenge is to scale your operations while maintaining the simplicity and elegance that made your product successful in the first place."
        },
        {
            "expert": "Reid",
            "text": "I've seen this pattern hundreds of times in my portfolio companies. The transition from product-market fit to scaling is where most startups fail. It's not just about hiring more people or raising more money. You need to fundamentally redesign your organization. The scrappy startup that got you to 10 million in revenue won't get you to 100 million."
        },
        {
            "expert": "Ginni",
            "text": "While I appreciate the startup perspective, let me offer a different view from the enterprise world. Scaling isn't just an internal challenge - it's about how you engage with increasingly complex customer needs. As you grow, you'll attract larger clients who demand enterprise-grade features: security, compliance, SLAs. This fundamentally changes your product roadmap."
        },
        {
            "expert": "Lila",
            "text": "Everyone's focusing on product and operations, but let's talk about brand. Your brand identity that resonated with early adopters might not work for the mainstream market. I've seen too many companies lose their soul trying to be everything to everyone. The challenge is evolving your brand narrative while staying authentic to your core values."
        }
    ]
    
    # Stream each expert's response
    for idx, response in enumerate(expert_responses):
        # Send expert_turn message
        await broadcast_to_debate(debate_id, {
            "type": "expert_turn",
            "expert_name": response["expert"],
            "turn_number": idx + 1
        })
        
        # Stream the text word by word
        words = response["text"].split()
        for i, word in enumerate(words):
            await broadcast_to_debate(debate_id, {
                "type": "text_chunk",
                "text": word + " ",
                "turn_number": idx + 1,
                "is_final": i == len(words) - 1
            })
            # Simulate typing delay
            await asyncio.sleep(0.05)
        
        # Pause between experts
        await asyncio.sleep(1.5)
    
    # Send debate complete message
    await broadcast_to_debate(debate_id, {
        "type": "debate_complete"
    })
    
    # Simulate final analysis generation
    await asyncio.sleep(2)
    
    # Send final analysis
    final_analysis = {
        "executive_summary": "The council identified scaling as a multifaceted challenge requiring careful balance between growth and core values. Key tensions emerged between maintaining product simplicity while adding enterprise features, preserving startup agility while building necessary processes, and evolving brand identity while staying authentic.",
        "key_insights": [
            "Product complexity is the hidden killer of scaling startups - success requires actively fighting feature creep",
            "Organizational redesign is mandatory - the structures that worked at $10M will fail at $100M", 
            "Enterprise customers fundamentally change your product trajectory through their compliance and security demands",
            "Brand evolution must be deliberate to avoid losing authenticity while appealing to mainstream markets"
        ],
        "action_items": [
            "Audit current product features and identify complexity that can be removed",
            "Design new organizational structure for the next growth phase before hitting scaling walls",
            "Create separate tracks for SMB and enterprise product development",
            "Develop brand evolution strategy that preserves core values while expanding market appeal"
        ]
    }
    
    await broadcast_to_debate(debate_id, {
        "type": "final_analysis",
        "analysis": final_analysis
    })
    
    # Mark debate as completed
    if debate_id in active_debates:
        active_debates[debate_id]["status"] = "completed"

@app.get("/")
async def root():
    return {"message": "AI Expert Council API", "version": "1.0.0"}