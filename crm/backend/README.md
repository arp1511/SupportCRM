# Customer Support CRM Backend

FastAPI backend for the Customer Support CRM assignment.

## Local Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

API docs are available at:

```text
http://localhost:8000/docs
```

## Environment Variables

| Name | Purpose |
| --- | --- |
| `ENVIRONMENT` | `development` or `production` |
| `DATABASE_URL` | SQLAlchemy database URL |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `SECRET_KEY` | Required secret value; must be changed in production |
