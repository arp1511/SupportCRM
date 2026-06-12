def test_create_ticket(client) -> None:
    payload = {
        "customer_name": "John Doe",
        "customer_email": "john.doe@example.com",
        "subject": "Internet connection is down",
        "description": "My fiber line has been down since morning.",
    }
    response = client.post("/api/tickets", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert "ticket_id" in data
    assert "created_at" in data
    assert data["ticket_id"] == "TKT-001"


def test_list_tickets(client) -> None:
    # Initially empty
    response = client.get("/api/tickets")
    assert response.status_code == 200
    assert response.json() == []

    # Create a ticket
    client.post("/api/tickets", json={
        "customer_name": "Alice Smith",
        "customer_email": "alice@example.com",
        "subject": "Login issues",
        "description": "Cannot log in to the portal.",
    })

    # Create another ticket
    client.post("/api/tickets", json={
        "customer_name": "Bob Jones",
        "customer_email": "bob@example.com",
        "subject": "Billing issue",
        "description": "Charged twice this month.",
    })

    # List all
    response = client.get("/api/tickets")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["customer_name"] == "Bob Jones"  # Descending order by created_at
    assert data[1]["customer_name"] == "Alice Smith"

    # Filter by status
    response = client.get("/api/tickets?status=Open")
    assert response.status_code == 200
    assert len(response.json()) == 2

    # Filter by non-existent status
    response = client.get("/api/tickets?status=Closed")
    assert response.status_code == 200
    assert len(response.json()) == 0

    # Search
    response = client.get("/api/tickets?search=Login")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["customer_name"] == "Alice Smith"


def test_get_ticket(client) -> None:
    # Create ticket
    create_res = client.post("/api/tickets", json={
        "customer_name": "Alice Smith",
        "customer_email": "alice@example.com",
        "subject": "Login issues",
        "description": "Cannot log in to the portal.",
    })
    ticket_id = create_res.json()["ticket_id"]

    response = client.get(f"/api/tickets/{ticket_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["ticket_id"] == ticket_id
    assert data["customer_name"] == "Alice Smith"
    assert data["status"] == "Open"
    assert data["notes"] == []

    # Non-existent ticket
    response = client.get("/api/tickets/TKT-999")
    assert response.status_code == 404


def test_update_ticket(client) -> None:
    # Create ticket
    create_res = client.post("/api/tickets", json={
        "customer_name": "Alice Smith",
        "customer_email": "alice@example.com",
        "subject": "Login issues",
        "description": "Cannot log in to the portal.",
    })
    ticket_id = create_res.json()["ticket_id"]

    # Update status
    response = client.put(f"/api/tickets/{ticket_id}", json={"status": "In Progress"})
    assert response.status_code == 200
    assert response.json()["success"] is True

    # Check update
    get_res = client.get(f"/api/tickets/{ticket_id}")
    assert get_res.json()["status"] == "In Progress"

    # Update with status and note
    response = client.put(f"/api/tickets/{ticket_id}", json={
        "status": "Closed",
        "note_text": "Resolved by resetting password."
    })
    assert response.status_code == 200

    # Check detail
    get_res = client.get(f"/api/tickets/{ticket_id}")
    data = get_res.json()
    assert data["status"] == "Closed"
    assert len(data["notes"]) == 1
    assert data["notes"][0]["note_text"] == "Resolved by resetting password."


def test_add_note(client) -> None:
    # Create ticket
    create_res = client.post("/api/tickets", json={
        "customer_name": "Alice Smith",
        "customer_email": "alice@example.com",
        "subject": "Login issues",
        "description": "Cannot log in to the portal.",
    })
    ticket_id = create_res.json()["ticket_id"]

    # Add note
    response = client.post(f"/api/tickets/{ticket_id}/notes", json={"note_text": "Spoke to customer."})
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["note_text"] == "Spoke to customer."

    # Verify notes in get ticket
    get_res = client.get(f"/api/tickets/{ticket_id}")
    assert len(get_res.json()["notes"]) == 1


def test_list_tickets_pagination(client) -> None:
    # Create 3 tickets
    for i in range(3):
        client.post("/api/tickets", json={
            "customer_name": f"User {i}",
            "customer_email": f"user{i}@example.com",
            "subject": f"Subject {i}",
            "description": f"Description {i}",
        })

    # Page 1, limit 2
    response = client.get("/api/tickets?limit=2&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["customer_name"] == "User 2"
    assert data[1]["customer_name"] == "User 1"

    # Page 2, limit 2
    response = client.get("/api/tickets?limit=2&offset=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["customer_name"] == "User 0"

