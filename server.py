"""
Prismatch FastAPI REST Server
Links the Python Pandas Engine with the Modern Frontend
"""

import os
from typing import Optional, List
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.engine import engine

app = FastAPI(
    title="Prismatch - AI Creator Marketplace API",
    description="Python & Pandas powered API for creator discovery, CreativeTwin matching, and Escrow",
    version="1.0.0"
)

# Enable CORS for Vite dev server and local clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RefineBriefRequest(BaseModel):
    text: str = ""

class CampaignBriefRequest(BaseModel):
    title: str = ""
    description: str = ""
    platforms: Optional[List[str]] = None
    content_type: str = "Reels / Short Video"
    preferred_models: Optional[List[str]] = None
    aspect_ratio: Optional[str] = "9:16 Vertical"
    budget: Optional[str] = ""
    creator_count: Optional[str] = ""
    timeline: Optional[str] = "standard"

class BookingRequest(BaseModel):
    creator_id: str
    tier: str = "Standard"
    amount: int = 2500
    client_name: str = "Brand Partner"

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Prismatch AI Engine",
        "backend": "Python 3.11 + Pandas",
        "creators_indexed": len(engine.creators_df)
    }

@app.get("/api/stats")
def get_stats():
    return engine.get_stats()

@app.get("/api/creators")
def get_creators(
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Category filter"),
    platform: Optional[str] = Query(None, description="Platform filter"),
    minBudget: Optional[int] = Query(None, description="Minimum budget"),
    maxBudget: Optional[int] = Query(None, description="Maximum budget"),
    deliveryDays: Optional[int] = Query(None, description="Max delivery days"),
    aiModels: Optional[str] = Query(None, description="Comma-separated AI models"),
    specializations: Optional[str] = Query(None, description="Comma-separated AI specializations"),
    licensing: Optional[str] = Query(None, description="Comma-separated licensing options"),
    sortBy: str = Query("relevance", description="Sort order: relevance, rating, price_asc, price_desc, orders")
):
    models_list = [m.strip() for m in aiModels.split(",")] if aiModels else None
    specs_list = [s.strip() for s in specializations.split(",")] if specializations else None
    lic_list = [l.strip() for l in licensing.split(",")] if licensing else None

    result = engine.filter_creators(
        query=q,
        category=category,
        platform=platform,
        min_budget=minBudget,
        max_budget=maxBudget,
        delivery_days=deliveryDays,
        ai_models=models_list,
        specializations=specs_list,
        licensing=lic_list,
        sort_by=sortBy
    )
    return result

@app.get("/api/creators/{creator_id}")
def get_creator_detail(creator_id: str):
    creator = engine.get_creator_by_id(creator_id)
    if not creator:
        raise HTTPException(status_code=404, detail=f"Creator '{creator_id}' not found")
    return creator

@app.post("/api/brief/refine-ai")
def refine_brief(req: RefineBriefRequest):
    return engine.refine_brief_ai(req.text)

@app.post("/api/campaigns/match")
def match_campaign(req: CampaignBriefRequest):
    brief_data = req.dict()
    matches = engine.match_creators(brief_data)
    return {
        "success": True,
        "total_matched": len(matches),
        "matches": matches
    }

@app.post("/api/bookings")
def book_creator(req: BookingRequest):
    result = engine.create_booking(req.dict())
    return result

@app.post("/api/favorites/toggle")
def toggle_favorite(payload: dict = Body(...)):
    creator_id = payload.get("creator_id")
    if not creator_id:
        raise HTTPException(status_code=400, detail="Missing creator_id")
    is_fav = engine.toggle_favorite(creator_id)
    return {"creator_id": creator_id, "is_favorite": is_fav}

# Static file serving if public directory exists
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(PUBLIC_DIR):
    app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    print("[INFO] Starting Prismatch FastAPI server on http://localhost:8000")
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)
