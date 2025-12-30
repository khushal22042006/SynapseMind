# backend/api/models.py - Data models for API
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SummaryRequest(BaseModel):
    text: str
    level: str = "quick"  # quick, detailed, academic

class MindMapRequest(BaseModel):
    text: str

class SummaryResponse(BaseModel):
    status: str
    summary: str
    level: str
    tokens_used: Optional[int] = None

class MindMapNode(BaseModel):
    id: str
    label: str
    type: str  # main, sub, detail
    position: Optional[Dict[str, float]] = None

class MindMapEdge(BaseModel):
    source: str
    target: str
    label: Optional[str] = None

class MindMapResponse(BaseModel):
    status: str
    nodes: List[MindMapNode]
    edges: List[MindMapEdge]