from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class TicketStatus(StrEnum):
    open = "Open"
    in_progress = "In Progress"
    closed = "Closed"


def normalize_required_string(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("Field must not be empty")
    return value


class TicketCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=120)
    customer_email: EmailStr
    subject: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=5000)

    @field_validator("customer_name", "subject", "description")
    @classmethod
    def trim_required_strings(cls, value: str) -> str:
        return normalize_required_string(value)


class TicketCreateResponse(BaseModel):
    ticket_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NoteCreate(BaseModel):
    note_text: str = Field(..., min_length=1, max_length=5000)

    @field_validator("note_text")
    @classmethod
    def trim_note(cls, value: str) -> str:
        return normalize_required_string(value)


class NoteRead(BaseModel):
    id: int
    note_text: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketUpdate(BaseModel):
    status: TicketStatus | None = None
    notes: str | None = Field(default=None, max_length=5000)
    note_text: str | None = Field(default=None, max_length=5000)

    @field_validator("notes", "note_text")
    @classmethod
    def trim_optional_note(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return normalize_required_string(value)

    @model_validator(mode="after")
    def require_status_or_note(self) -> "TicketUpdate":
        if self.status is None and self.notes is None and self.note_text is None:
            raise ValueError("Provide status, notes, or note_text")
        return self



class TicketUpdateResponse(BaseModel):
    success: bool = True
    updated_at: datetime


class TicketListItem(BaseModel):
    ticket_id: str
    customer_name: str
    subject: str
    status: TicketStatus
    category: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketDetail(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    status: TicketStatus
    category: str | None = None
    created_at: datetime
    updated_at: datetime
    notes: list[NoteRead] = []

    model_config = ConfigDict(from_attributes=True)



class DashboardSummary(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    closed_tickets: int
    total_notes: int
