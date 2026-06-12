from app.db.session import Base, engine, settings
from app.models import Note, Ticket, User




def init_db() -> None:
    sqlite_path = settings.sqlite_database_path
    if sqlite_path is not None:
        sqlite_path.parent.mkdir(parents=True, exist_ok=True)

    Base.metadata.create_all(bind=engine)
