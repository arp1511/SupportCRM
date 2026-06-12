import pytest
from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import Session, sessionmaker
from fastapi import Request, Depends
from fastapi.testclient import TestClient

from app.db.session import Base, get_db
from app.main import app
from app.models import Note, Ticket

# Use in-memory SQLite with StaticPool for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(name="db_session")
def fixture_db_session() -> Generator[Session, None, None]:
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(name="client")
def fixture_client(request, db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        # Check if the test is an authentication/authorization test
        is_auth_test = "auth" in request.node.name
        if not is_auth_test:
            # Seed default admin user and pre-authenticate legacy tests
            from app.models.user import User
            from app.services import auth_service
            from sqlalchemy import select
            
            stmt = select(User).where(User.email == "mockadmin@crm.com")
            admin = db_session.scalar(stmt)
            if not admin:
                admin = User(
                    email="mockadmin@crm.com",
                    hashed_password=auth_service.get_password_hash("admin123"),
                    full_name="Mock Admin",
                    role="admin"
                )
                db_session.add(admin)
                db_session.commit()
                db_session.refresh(admin)
            
            token = auth_service.create_access_token(data={"sub": admin.email})
            test_client.headers["Authorization"] = f"Bearer {token}"

        yield test_client
        
    app.dependency_overrides.clear()
