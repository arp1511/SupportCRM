import re
import logging
from sqlalchemy import func, or_, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, selectinload

from app.core.errors import NotFoundError, ServiceError
from app.models import Note, Ticket
from app.schemas import DashboardSummary, NoteCreate, TicketCreate, TicketStatus, TicketUpdate

logger = logging.getLogger(__name__)

SEARCH_MAX_LENGTH = 100
# Removes non-printable characters that can break database queries or UI layouts
CONTROL_CHARS_PATTERN = re.compile(r"[\x00-\x1f\x7f]")


def sanitize_search_query(search: str | None) -> str | None:
    if search is None:
        return None

    cleaned = CONTROL_CHARS_PATTERN.sub("", search).strip()
    if not cleaned:
        return None

    # Cap search length to prevent super long search string DOS
    return cleaned[:SEARCH_MAX_LENGTH]


def escape_like_query(value: str) -> str:
    """
    Escapes special SQL LIKE wildcards (like % and _) so users 
    can search for exact strings without triggering DB wildcard parsing.
    """
    return (
        value.replace("\\", "\\\\")
        .replace("%", "\\%")
        .replace("_", "\\_")
    )


def get_ticket_or_404(db: Session, ticket_id: str) -> Ticket:
    # We prefetch notes using selectinload to avoid N+1 query problems in detail view
    stmt = (
        select(Ticket)
        .options(selectinload(Ticket.notes))
        .where(Ticket.ticket_id == ticket_id)
    )
    ticket = db.scalar(stmt)
    if ticket is None:
        raise NotFoundError("Ticket not found")
    return ticket


def create_ticket(db: Session, payload: TicketCreate) -> Ticket:
    try:
        # Default category in case Gemini drops the request or doesn't resolve
        category_val = "Technical Issue"
        try:
            from app.services import ai_service
            # Let the AI classify the issue context
            ai_res = ai_service.categorize_ticket(payload.subject, payload.description)
            if ai_res and ai_res.category:
                category_val = ai_res.category.value
        except Exception as ai_exc:
            # Gaps in AI key setup or network issues should NOT break core ticket registration.
            # Log it and proceed with the fallback category.
            logger.warning(f"AI ticket classification failed during creation, falling back: {ai_exc}")

        ticket = Ticket(
            customer_name=payload.customer_name,
            customer_email=str(payload.customer_email),
            subject=payload.subject,
            description=payload.description,
            status=TicketStatus.open.value,
            category=category_val,
        )

        db.add(ticket)
        db.flush()
        # Stagger the ticket ID format using DB auto-increment ID
        ticket.ticket_id = f"TKT-{ticket.id:03d}"
        db.commit()
        db.refresh(ticket)
        return ticket
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Failed to insert ticket record")
        raise ServiceError("Unable to create ticket") from exc


def list_tickets(
    db: Session,
    status: TicketStatus | None = None,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
    customer_email: str | None = None,
) -> list[Ticket]:
    stmt = select(Ticket)

    if customer_email is not None:
        stmt = stmt.where(Ticket.customer_email == customer_email)


    if status is not None:
        stmt = stmt.where(Ticket.status == status.value)

    sanitized_search = sanitize_search_query(search)
    if sanitized_search is not None:
        # Parameter binding handles SQL injection; escaping handles literal match syntax
        pattern = f"%{escape_like_query(sanitized_search)}%"
        stmt = stmt.where(
            or_(
                Ticket.customer_name.ilike(pattern, escape="\\"),
                Ticket.customer_email.ilike(pattern, escape="\\"),
                Ticket.ticket_id.ilike(pattern, escape="\\"),
                Ticket.subject.ilike(pattern, escape="\\"),
                Ticket.description.ilike(pattern, escape="\\"),
            )
        )

    # Stagger limits on list output to prevent query DOS (Unbounded loads)
    stmt = stmt.order_by(Ticket.created_at.desc()).limit(limit).offset(offset)
    return list(db.scalars(stmt).all())


def get_ticket_detail(db: Session, ticket_id: str) -> Ticket:
    return get_ticket_or_404(db, ticket_id)


def add_note(db: Session, ticket_id: str, payload: NoteCreate) -> Note:
    try:
        ticket = get_ticket_or_404(db, ticket_id)
        note = Note(ticket_id=ticket.ticket_id, note_text=payload.note_text)
        db.add(note)
        db.commit()
        db.refresh(note)
        return note
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception(f"Failed to append note for ticket {ticket_id}")
        raise ServiceError("Unable to add note") from exc


def update_ticket(db: Session, ticket_id: str, payload: TicketUpdate) -> Ticket:
    try:
        ticket = get_ticket_or_404(db, ticket_id)

        if payload.status is not None:
            ticket.status = payload.status.value

        note_content = payload.notes or payload.note_text
        if note_content is not None:
            # If the user included an update explanation note, we save it here
            db.add(Note(ticket_id=ticket.ticket_id, note_text=note_content))

        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        return get_ticket_or_404(db, ticket_id)
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception(f"Failed to update status on ticket {ticket_id}")
        raise ServiceError("Unable to update ticket") from exc


def get_dashboard_summary(db: Session) -> DashboardSummary:
    # Runs group count queries to minimize loading all models into server memory
    total_tickets = db.scalar(select(func.count(Ticket.id))) or 0
    total_notes = db.scalar(select(func.count(Note.id))) or 0

    status_counts = dict(
        db.execute(
            select(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status)
        ).all()
    )

    return DashboardSummary(
        total_tickets=total_tickets,
        open_tickets=status_counts.get(TicketStatus.open.value, 0),
        in_progress_tickets=status_counts.get(TicketStatus.in_progress.value, 0),
        closed_tickets=status_counts.get(TicketStatus.closed.value, 0),
        total_notes=total_notes,
    )
