from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas import DashboardSummary
from app.services import ticket_service


from app.services import auth_service
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardSummary)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.require_admin),
) -> DashboardSummary:
    return ticket_service.get_dashboard_summary(db)

