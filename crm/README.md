# Customer Support CRM (Zendesk & Frappe CRM Inspired)

A complete, production-ready, lightweight Customer Support Ticketing CRM System designed with a beautiful minimalist UI, structured AI insights (powered by Gemini), robust database indexing, and an end-to-end interactive Support Pipeline Kanban board.

---

## 1. Project Structure Explanation

The project has a clear separation of concerns with structured folder layouts:

```text
crm/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── dashboard.py   # Dashboard analytical endpoints
│   │   │   │   └── tickets.py     # Ticket CRUD & AI helper endpoints
│   │   │   └── router.py          # API route bindings (/api)
│   │   ├── core/
│   │   │   ├── config.py          # Pydantic Settings management (env loader)
│   │   │   └── errors.py          # Central exception handlers (DoS/leak protection)
│   │   ├── db/
│   │   │   ├── init_db.py         # DB startup/tables creation routine
│   │   │   └── session.py         # SQLAlchemy Engine & SessionLocal setup
│   │   ├── models/
│   │   │   └── ticket.py          # SQLAlchemy ORM models (Ticket, Note)
│   │   ├── schemas/
│   │   │   └── ticket.py          # Pydantic schema validation & serialization models
│   │   ├── services/
│   │   │   ├── ai_service.py      # Gemini API wrappers, structured schema, and retry mechanism
│   │   │   └── ticket_service.py  # Core business logic handlers (CRUD, Sanitization, pagination)
│   │   └── main.py                # FastAPI lifecycle, lifespan events, CORS configurations
│   ├── tests/                     # Comprehensive endpoint tests (pytest + httpx)
│   ├── seed.py                    # Script to pre-populate DB with 20 rich sample records
│   └── requirements.txt           # Python backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js          # Axios API abstraction layer
│   │   ├── components/
│   │   │   ├── EmptyState.jsx     # Visual fallback cards for search/lists
│   │   │   ├── ErrorDisplay.jsx   # Friendly UI message panel with retry triggers
│   │   │   ├── LoadingSpinner.jsx # Loaders and skeleton configurations
│   │   │   └── Navbar.jsx         # Mobile-responsive desktop/mobile tab layout
│   │   ├── context/
│   │   │   ├── ThemeContext.jsx   # Light/Dark mode state persistent in LocalStorage
│   │   │   └── ToastContext.jsx   # Stackable notification overlay system
│   │   ├── pages/
│   │   │   ├── CreateTicket.jsx   # Create ticket with validation constraints
│   │   │   ├── Dashboard.jsx      # Metrics overview grid and recent logs
│   │   │   ├── TicketDetails.jsx  # Customer history profile, updates, timeline, AI Copilot
│   │   │   └── TicketsList.jsx    # Tickets list & pipeline board views (Kanban)
│   │   ├── App.jsx                # Router endpoints
│   │   ├── index.css              # Tailwind CSS v4 entry point
│   │   └── main.jsx               # React DOM bootstrap
│   ├── vite.config.js             # Vite configuration with tailwindcss plugin
│   └── package.json               # Frontend dependencies
```

---

## 2. Architecture Explanation

The system is built as a decoupled **Single Page Application (SPA)** communicating with a stateless **REST API**:

- **Layered Architecture**: The backend uses a service-based pattern. Routes handle HTTP requests/responses, Pydantic handles validation, and Services handle database operations and API communication. This isolates side effects and ensures testability.
- **AI Integration (Gemini 2.5 Flash)**: Integrated using `google-genai` with structured JSON schema responses. It features exponential backoff retry logic (`tenacity`) and fallback protection (automatic classification defaults to `Technical Issue` if the API is down or keys are not configured).
- **Concurrency & Database**: Uses SQLite for low latency development, with `check_same_thread=False` and connection pool events enabling `PRAGMA foreign_keys=ON`. Search operations are protected against SQL injection by using the SQLAlchemy ORM compiler for parameterized `ilike` queries, with specialized regex filters that escape control characters.

---

## 3. API Documentation

### Tickets API

#### 1. `POST /api/tickets`
Creates a new support ticket. Automatically classifies the category using Gemini API (with auto-fallback).
*   **Request JSON**:
    ```json
    {
      "customer_name": "Jane Smith",
      "customer_email": "jane@example.com",
      "subject": "Unable to load billing invoice page",
      "description": "The page remains white when opening the PDF link."
    }
    ```
*   **Response JSON (201 Created)**:
    ```json
    {
      "ticket_id": "TKT-021",
      "created_at": "2026-06-12T10:15:00Z"
    }
    ```

#### 2. `GET /api/tickets`
Lists tickets sorted chronologically (latest first). Supports filters and pagination.
*   **Query Parameters**:
    - `status`: Filter by status (`Open`, `In Progress`, `Closed`)
    - `search`: Case-insensitive search on name, email, ID, subject, or description.
    - `limit`: Default `50` (range 1-100).
    - `offset`: Default `0`.
*   **Response JSON (200 OK)**:
    ```json
    [
      {
        "ticket_id": "TKT-021",
        "customer_name": "Jane Smith",
        "subject": "Unable to load billing invoice page",
        "status": "Open",
        "category": "Billing",
        "created_at": "2026-06-12T10:15:00Z"
      }
    ]
    ```

#### 3. `GET /api/tickets/{ticket_id}`
Returns full ticket details including all nested agent notes/comments and AI category.
*   **Response JSON (200 OK)**:
    ```json
    {
      "ticket_id": "TKT-021",
      "customer_name": "Jane Smith",
      "customer_email": "jane@example.com",
      "subject": "Unable to load billing invoice page",
      "description": "The page remains white when opening the PDF link.",
      "status": "Open",
      "category": "Billing",
      "created_at": "2026-06-12T10:15:00Z",
      "updated_at": "2026-06-12T10:15:00Z",
      "notes": [
        {
          "id": 1,
          "note_text": "System transition: Status changed to Open",
          "created_at": "2026-06-12T10:15:00Z"
        }
      ]
    }
    ```

#### 4. `PUT /api/tickets/{ticket_id}`
Updates the ticket status and optionally appends an internal note in a single transaction.
*   **Request JSON**:
    ```json
    {
      "status": "In Progress",
      "note_text": "Investigating logs."
    }
    ```
*   **Response JSON (200 OK)**:
    ```json
    {
      "success": true,
      "updated_at": "2026-06-12T10:18:00Z"
    }
    ```

#### 5. `POST /api/tickets/{ticket_id}/notes`
Appends a standalone internal note/comment to the ticket history log.
*   **Request JSON**:
    ```json
    {
      "note_text": "Spoke with client on phone. Resolution in progress."
    }
    ```

#### 6. `GET /api/dashboard`
Returns total counts, status distributions, and notes statistics.

---

## 4. Local Setup Instructions

### Backend Local Setup
1.  Navigate to the backend directory:
    ```bash
    cd crm/backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv .venv
    # Windows:
    .venv\Scripts\activate
    # macOS/Linux:
    source .venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure environment:
    ```bash
    copy .env.example .env
    ```
    *(Optional: Add your `GEMINI_API_KEY` inside `.env` to enable live AI analysis)*
5.  Seed the SQLite database:
    ```bash
    python seed.py
    ```
6.  Start development server:
    ```bash
    python -m uvicorn app.main:app --reload
    ```
    The API docs will be active at `http://localhost:8000/docs`.

### Frontend Local Setup
1.  Navigate to the frontend directory:
    ```bash
    cd crm/frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Start development environment:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

---

## 5. Deployment Instructions

### Backend Setup (Railway)
1.  Create a new project on Railway and choose **Deploy from GitHub repo**.
2.  Under **Variables**, add:
    - `ENVIRONMENT`: `production`
    - `DATABASE_URL`: `sqlite:////app/data/support_crm.db`
    - `SECRET_KEY`: `<some-secure-random-hash>`
    - `CORS_ORIGINS`: `https://your-domain.vercel.app`
    - `GEMINI_API_KEY`: `<your-gemini-api-key>`
3.  Create a **Volume** mount of 1GB on Railway and configure the mount path as `/app/data`. This guarantees SQLite database writes are persistent across redeployments.
4.  Railway will automatically detect the entry port and build using `requirements.txt`.

### Frontend Setup (Vercel)
1.  Create a new project on Vercel, link your repo, and configure:
    - Root Directory: `crm/frontend`
    - Framework Preset: `Vite`
    - Build Command: `npm run build`
    - Output Directory: `dist`
2.  Add **Environment Variable**:
    - `VITE_API_URL`: `https://your-backend-railway-url.up.railway.app`
3.  Deploy. Subroute page refreshes are handled natively via `vercel.json` rewrites.
