from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import json
import re

app = FastAPI(title="SynapseMind API", version="1.0.0")

# Allow Chrome extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class SummaryRequest(BaseModel):
    text: str
    level: str = "quick"

class MindMapRequest(BaseModel):
    text: str

class SummaryResponse(BaseModel):
    summary: str
    level: str
    word_count: Optional[int] = None

class MindMapNode(BaseModel):
    id: str
    label: str
    type: str = "default"

class MindMapEdge(BaseModel):
    source: str
    target: str
    label: Optional[str] = ""

class MindMapResponse(BaseModel):
    nodes: List[MindMapNode]
    edges: List[MindMapEdge]
    central_topic: Optional[str] = None

# Smart Mock AI (Better than simple mock)
def smart_summary(text: str, level: str) -> dict:
    """Generate intelligent-looking summaries"""
    words = text.split()
    
    if level == "quick":
        summary = f"This text discusses {words[0] if words else 'the topic'} and covers key aspects in about {len(words)} words."
    elif level == "detailed":
        first_50 = " ".join(words[:50])
        summary = f"Detailed analysis: {first_50}... The text explores multiple dimensions across {len(words)} words."
    else:  # academic
        summary = f"• Key Concept: {words[0] if words else 'Main Idea'}\n• Core Principles: Fundamental aspects\n• Applications: Practical implications\n• Conclusion: Summary of findings"
    
    return {
        "summary": summary,
        "level": level,
        "word_count": len(summary.split())
    }

def smart_mindmap(text: str) -> dict:
    """Generate realistic mind map structure"""
    words = [w for w in text.split() if len(w) > 3][:15]  # Get meaningful words
    
    if not words:
        words = ["Main", "Topic", "Analysis", "Results", "Conclusion"]
    
    nodes = []
    edges = []
    
    # Central topic (combine first 2-3 words)
    central = " ".join(words[:min(3, len(words))])
    nodes.append({"id": "0", "label": central, "type": "main"})
    
    # Sub-topics (next 4-6 words)
    for i in range(1, min(5, len(words)-3)):
        nodes.append({"id": str(i), "label": words[i+2], "type": "sub"})
        edges.append({"source": "0", "target": str(i), "label": "relates to"})
        
        # Add details for some sub-topics
        if i % 2 == 0 and len(words) > i+6:
            detail_id = f"{i}_detail"
            nodes.append({"id": detail_id, "label": f"Example: {words[i+5]}", "type": "detail"})
            edges.append({"source": str(i), "target": detail_id, "label": "includes"})
    
    return {
        "central_topic": central,
        "nodes": nodes,
        "edges": edges
    }

# API Endpoints
@app.post("/api/summary", response_model=SummaryResponse)
async def get_summary(request: SummaryRequest):
    """Generate summary"""
    return smart_summary(request.text, request.level)

@app.post("/api/mindmap", response_model=MindMapResponse)
async def get_mindmap(request: MindMapRequest):
    """Generate mind map"""
    return smart_mindmap(request.text)

@app.get("/")
async def root():
    return {
        "message": "SynapseMind Backend API",
        "status": "running",
        "mode": "smart-mock",
        "endpoints": ["POST /api/summary", "POST /api/mindmap", "GET /api/test"]
    }

@app.get("/api/test")
async def test():
    return {"status": "active", "python_version": "3.14", "note": "Using smart mock AI"}

@app.get("/health")
async def health():
    return {"status": "healthy", "ready": True}

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 SYNAPSE MIND BACKEND STARTING")
    print("=" * 50)
    print("📡 API: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("🧠 Mode: Smart Mock AI (Python 3.14 compatible)")
    print("⚡ Endpoints:")
    print("   POST /api/summary - Generate summaries")
    print("   POST /api/mindmap - Generate mind maps")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")