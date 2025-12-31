# backend/main.py - YOUR FIRST CRITICAL FILE
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="SynapseMind Backend API",
    description="AI-powered summary and mind map generation",
    version="1.0.0"
)

# Configure CORS - CRITICAL for Chrome extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class SummaryRequest(BaseModel):
    text: str
    level: str = "quick"  # quick, detailed, academic

class MindMapRequest(BaseModel):
    text: str

class HealthResponse(BaseModel):
    status: str
    version: str
    service: str

# Health check endpoint - ALWAYS INCLUDE
@app.get("/")
async def root():
    return {
        "message": "SynapseMind Backend API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "summary": "/api/summary",
            "mindmap": "/api/mindmap",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        service="synapsemind-backend"
    )

# Placeholder endpoints - WILL IMPLEMENT TOMORROW
@app.post("/api/summary")
async def generate_summary(request: SummaryRequest):
    return {
        "status": "success",
        "message": "Summary endpoint - implementation in progress",
        "data": {
            "summary": "Sample summary for: " + request.text[:50] + "...",
            "level": request.level
        }
    }

@app.post("/api/mindmap")
async def generate_mindmap(request: MindMapRequest):
    return {
        "status": "success",
        "message": "Mind map endpoint - implementation in progress",
        "data": {
            "nodes": [
                {"id": "1", "label": "Main Concept", "type": "main"},
                {"id": "2", "label": "Sub Concept 1", "type": "sub"},
                {"id": "3", "label": "Sub Concept 2", "type": "sub"}
            ],
            "edges": [
                {"source": "1", "target": "2", "label": "includes"},
                {"source": "1", "target": "3", "label": "includes"}
            ]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)