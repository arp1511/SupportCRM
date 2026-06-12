from fastapi import APIRouter

from app.api.routes import dashboard, tickets, auth


api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(tickets.router)
api_router.include_router(dashboard.router)

