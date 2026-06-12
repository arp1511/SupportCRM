from app.db.session import Base, engine, settings
from app.models import Note, Ticket, User




def init_db() -> None:
    sqlite_path = settings.sqlite_database_path
    if sqlite_path is not None:
        sqlite_path.parent.mkdir(parents=True, exist_ok=True)

    Base.metadata.create_all(bind=engine)

    # Automatically seed fresh database installations with demo accounts
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            from seed import seed_db
            seed_db()
    except Exception as e:
        print("Self-seeding check ignored/skipped:", e)
    finally:
        db.close()
