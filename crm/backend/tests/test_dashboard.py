def test_get_dashboard(client) -> None:
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["total_tickets"] == 0
    assert data["open_tickets"] == 0
    assert data["in_progress_tickets"] == 0
    assert data["closed_tickets"] == 0
    assert data["total_notes"] == 0

    # Create ticket
    create_res = client.post("/api/tickets", json={
        "customer_name": "Alice Smith",
        "customer_email": "alice@example.com",
        "subject": "Login issues",
        "description": "Cannot log in.",
    })
    ticket_id = create_res.json()["ticket_id"]

    # Add note
    client.post(f"/api/tickets/{ticket_id}/notes", json={"note_text": "Working on it."})

    # Create another, closed ticket
    create_res2 = client.post("/api/tickets", json={
        "customer_name": "Bob Smith",
        "customer_email": "bob@example.com",
        "subject": "Reset issues",
        "description": "Cannot reset password.",
    })
    ticket_id2 = create_res2.json()["ticket_id"]
    client.put(f"/api/tickets/{ticket_id2}", json={"status": "Closed", "note_text": "Closed it."})

    # Check dashboard again
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["total_tickets"] == 2
    assert data["open_tickets"] == 1
    assert data["closed_tickets"] == 1
    assert data["total_notes"] == 2
