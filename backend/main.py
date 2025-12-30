# simple_main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(
    title="SynapseMind Backend",
    description="AI-powered summaries and mind maps",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SummaryRequest(BaseModel):
    text: str
    level: str = "quick"

class MindMapRequest(BaseModel):
    text: str

@app.get("/")
def root():
    return {
        "message": "SynapseMind Backend API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/summary")
def generate_summary(request: SummaryRequest):
    return {
        "status": "success",
        "summary": f"Summary of: {request.text[:50]}...",
        "level": request.level
    }

@app.post("/api/mindmap")
def generate_mindmap(request: MindMapRequest):
    return {
        "status": "success",
        "nodes": [
            {"id": "1", "label": "Main Topic", "type": "main"},
            {"id": "2", "label": "Sub Topic 1", "type": "sub"}
        ],
        "edges": [{"source": "1", "target": "2"}]
    }

if __name__ == "__main__":
    print("🚀 Starting SynapseMind Backend...")
    print("📡 http://127.0.0.1:8000")
    print("📊 Health check: http://127.0.0.1:8000/health")
    print("📚 API docs: http://127.0.0.1:8000/docs")
    print("\n💡 Press Ctrl+C to stop")
    uvicorn.run(app, host="127.0.0.1", port=8000)