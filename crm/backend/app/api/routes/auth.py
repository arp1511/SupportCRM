from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Ticket, Note, User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    # Check if email is already taken
    stmt = select(User).where(User.email == payload.email)
    existing_user = db.scalar(stmt)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already registered"
        )
    
    hashed_pwd = auth_service.get_password_hash(payload.password)
    user = User(
        email=payload.email,
        hashed_password=hashed_pwd,
        full_name=payload.full_name,
        role=payload.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if user.role == "customer":
        # Check if they already have tickets associated with their email (e.g. pre-seeded or guest tickets)
        tkt_count_stmt = select(func.count(Ticket.id)).where(Ticket.customer_email == user.email)
        tkt_count = db.scalar(tkt_count_stmt)
        if not tkt_count or tkt_count == 0:
            # Seed sample tickets for the new customer
            t1 = Ticket(
                customer_name=user.full_name,
                customer_email=user.email,
                subject="Sample Ticket: Account Verification Request",
                description="Hello! I just created my account. I wanted to verify that my profile is fully set up and ready to open support requests.",
                status="Open",
                category="Account Issue"
            )
            db.add(t1)
            db.flush()
            t1.ticket_id = f"TKT-{t1.id:03d}"

            note1 = Note(
                ticket_id=t1.ticket_id,
                note_text="System: Welcome to Support CRM! A team member will verify your profile shortly."
            )
            db.add(note1)

            t2 = Ticket(
                customer_name=user.full_name,
                customer_email=user.email,
                subject="Sample Ticket: Billing Setup and Pricing Information",
                description="Could you please provide details about configuring automatic credit card billing for monthly billing cycles?",
                status="Closed",
                category="Billing"
            )
            db.add(t2)
            db.flush()
            t2.ticket_id = f"TKT-{t2.id:03d}"

            note2 = Note(
                ticket_id=t2.ticket_id,
                note_text="Support Agent: We have configured automatic credit card billing. The invoice will be sent to your registered email on the 1st of every month."
            )
            db.add(note2)

            db.commit()
            db.refresh(user)

    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    stmt = select(User).where(User.email == payload.email)
    user = db.scalar(stmt)
    if not user or not auth_service.verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    access_token = auth_service.create_access_token(data={"sub": user.email})
    return TokenResponse(
        access_token=access_token,
        role=user.role,
        full_name=user.full_name,
        email=user.email
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(auth_service.get_current_user)) -> UserResponse:
    return current_user
