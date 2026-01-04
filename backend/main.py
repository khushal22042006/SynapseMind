# backend/main.py - UPDATED WITH GEMINI INTEGRATION
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# Try to import Gemini service
try:
    from  services.gemini_service  import GeminiService
    gemini_service = GeminiService(model_name="gemini-2.5-flash")
    print("✅ Gemini Service initialized successfully")
except ImportError as e:
    print(f"⚠️  Could not import Gemini service: {e}")
    gemini_service = None
except Exception as e:
    print(f"⚠️  Failed to initialize Gemini: {e}")
    gemini_service = None

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
    gemini_ready: bool = False

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "SynapseMind Backend API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "summary": "/api/summary (POST)",
            "mindmap": "/api/mindmap (POST)",
            "usage": "/api/usage",
            "test": "/api/test",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    gemini_ready = gemini_service is not None
    if gemini_service:
        gemini_ready = gemini_service.test_connection()
    
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        service="synapsemind-backend",
        gemini_ready=gemini_ready
    )

@app.get("/api/usage")
async def get_usage_stats():
    """Get current API usage statistics"""
    if gemini_service:
        stats = gemini_service.get_usage_stats()
        return {
            "status": "success",
            "stats": stats,
            "message": f"You have {stats['remaining_today']:,} requests left today"
        }
    return {"status": "error", "message": "Gemini service not available"}

# REAL SUMMARY ENDPOINT
@app.post("/api/summary")
async def generate_summary(request: SummaryRequest):
    """Generate AI summary using Gemini"""
    if not gemini_service:
        raise HTTPException(
            status_code=503, 
            detail="Gemini service not available. Check backend logs."
        )
    
    # Validate input
    if not request.text or len(request.text.strip()) < 10:
        raise HTTPException(
            status_code=400, 
            detail="Text too short. Please provide at least 10 characters."
        )
    
    if request.level not in ["quick", "detailed", "academic"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid level. Use: quick, detailed, or academic"
        )
    
    try:
        print(f"📝 Generating {request.level} summary for {len(request.text)} chars")
        
        # Call Gemini service
        summary = gemini_service.generate_summary(request.text, request.level)
        
        return {
            "status": "success",
            "summary": summary,
            "level": request.level,
            "characters_processed": len(request.text),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Summary generation error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate summary: {str(e)}"
        )

# REAL MIND MAP ENDPOINT
@app.post("/api/mindmap")
async def generate_mindmap(request: MindMapRequest):
    """Generate AI mind map using Gemini"""
    if not gemini_service:
        raise HTTPException(
            status_code=503, 
            detail="Gemini service not available. Check backend logs."
        )
    
    # Validate input
    if not request.text or len(request.text.strip()) < 20:
        raise HTTPException(
            status_code=400, 
            detail="Text too short for mind map. Please provide at least 20 characters."
        )
    
    try:
        print(f"🗺️ Generating mind map for {len(request.text)} chars")
        
        # Call Gemini service
        mindmap = gemini_service.generate_mindmap(request.text)
        
        return {
            "status": "success",
            "nodes": mindmap.get("nodes", []),
            "edges": mindmap.get("edges", []),
            "total_concepts": len(mindmap.get("nodes", [])),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Mind map generation error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate mind map: {str(e)}"
        )

# Test endpoint for quick checks
@app.post("/api/test")
async def test_api(text: str = "AI is transforming education through personalized learning."):
    """Quick test endpoint"""
    if gemini_service:
        try:
            summary = gemini_service.generate_summary(text, "quick")
            return {
                "test": "passed",
                "summary": summary,
                "service": "active",
                "model": gemini_service.model_name
            }
        except Exception as e:
            return {
                "test": "failed", 
                "error": str(e),
                "service": "error"
            }
    
    return {
        "test": "failed", 
        "error": "service not available",
        "service": "inactive"
    }

# Simple cache for demo
demo_cache = {}

@app.post("/api/summary/cached")
async def cached_summary(request: SummaryRequest):
    """
    Cached summary endpoint - good for demo to avoid rate limits
    """
    cache_key = f"{hash(request.text[:100])}_{request.level}"
    
    # Check cache (valid for 1 hour)
    if cache_key in demo_cache:
        cache_time, cached_data = demo_cache[cache_key]
        if datetime.now() - cache_time < timedelta(hours=1):
            return {**cached_data, "cached": True, "cache_time": cache_time.isoformat()}
    
    # Generate fresh if not cached
    result = await generate_summary(request)
    demo_cache[cache_key] = (datetime.now(), result)
    
    return {**result, "cached": False, "cache_time": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.getenv("PORT", 8000))


    print("🚀 Starting SynapseMind Backend API...")
    print(f"📡 Port: {port}")
    print(f"📚 API Documentation: http://localhost:{port}/docs")
    print(f"🏥 Health check: http://localhost:{port}/health")
    
    uvicorn.run(app, host="0.0.0.0", port=port)