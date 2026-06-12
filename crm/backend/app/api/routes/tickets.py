from fastapi import APIRouter, Depends, Path, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas import (
    NoteCreate,
    NoteRead,
    TicketCreate,
    TicketCreateResponse,
    TicketDetail,
    TicketListItem,
    TicketStatus,
    TicketUpdate,
    TicketUpdateResponse,
)
from app.services import ai_service, ticket_service, auth_service

router = APIRouter(prefix="/tickets", tags=["tickets"])

TicketIdPath = Path(
    ...,
    min_length=7,
    max_length=20,
    pattern=r"^TKT-\d{3,}$",
    description="Human-readable ticket ID, for example TKT-001",
)


@router.post(
    "",
    response_model=TicketCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)) -> TicketCreateResponse:
    # Creating a ticket is public (allowing anonymous or guest customer submissions)
    return ticket_service.create_ticket(db, payload)


@router.get("", response_model=list[TicketListItem])
def list_tickets(
    status_filter: TicketStatus | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None, max_length=100),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user),
) -> list[TicketListItem]:
    # Customers can only view their own tickets; Admins can see all tickets
    customer_email = current_user.email if current_user.role == "customer" else None
    return ticket_service.list_tickets(
        db, 
        status=status_filter, 
        search=search, 
        limit=limit, 
        offset=offset, 
        customer_email=customer_email
    )


@router.get("/{ticket_id}", response_model=TicketDetail)
def get_ticket(
    ticket_id: str = TicketIdPath,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user),
) -> TicketDetail:
    ticket = ticket_service.get_ticket_detail(db, ticket_id)
    # Customers are restricted from viewing other customers' tickets
    if current_user.role == "customer" and ticket.customer_email != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this ticket details"
        )
    return ticket


@router.put("/{ticket_id}", response_model=TicketUpdateResponse)
def update_ticket(
    payload: TicketUpdate,
    ticket_id: str = TicketIdPath,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.require_admin),
) -> TicketUpdateResponse:
    ticket = ticket_service.update_ticket(db, ticket_id, payload)
    return TicketUpdateResponse(success=True, updated_at=ticket.updated_at)


@router.post(
    "/{ticket_id}/notes",
    response_model=NoteRead,
    status_code=status.HTTP_201_CREATED,
)
def create_note(
    payload: NoteCreate,
    ticket_id: str = TicketIdPath,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.require_admin),
) -> NoteRead:
    return ticket_service.add_note(db, ticket_id, payload)


@router.post(
    "/{ticket_id}/ai-categorize",
    response_model=ai_service.TicketCategoryResponse,
)
def categorize_ticket(
    ticket_id: str = TicketIdPath,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.require_admin),
) -> ai_service.TicketCategoryResponse:
    ticket = ticket_service.get_ticket_detail(db, ticket_id)
    return ai_service.categorize_ticket(ticket.subject, ticket.description)


@router.post(
    "/{ticket_id}/ai-summarize",
    response_model=ai_service.TicketSummaryResponse,
)
def summarize_ticket(
    ticket_id: str = TicketIdPath,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.require_admin),
) -> ai_service.TicketSummaryResponse:
    ticket = ticket_service.get_ticket_detail(db, ticket_id)
    return ai_service.summarize_ticket(ticket.subject, ticket.description)
