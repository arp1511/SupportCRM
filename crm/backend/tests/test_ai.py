import pytest
from unittest.mock import patch
from app.services import ai_service


def test_ai_categorize_endpoint(client) -> None:
    # Create a ticket
    create_res = client.post("/api/tickets", json={
        "customer_name": "Alice Smith",
        "customer_email": "alice@example.com",
        "subject": "Login issues",
        "description": "Cannot log in to the portal.",
    })
    ticket_id = create_res.json()["ticket_id"]

    # Mock call_gemini_api to simulate categorization return
    with patch("app.services.ai_service.call_gemini_api") as mock_call:
        mock_call.return_value = '{"category": "Account Issue"}'
        
        response = client.post(f"/api/tickets/{ticket_id}/ai-categorize")
        assert response.status_code == 200, response.text
        data = response.json()
        assert data["category"] == "Account Issue"
        
        # Verify call arguments
        mock_call.assert_called_once()
        assert "Login issues" in mock_call.call_args[0][0]


def test_ai_summarize_endpoint(client) -> None:
    # Create a ticket
    create_res = client.post("/api/tickets", json={
        "customer_name": "Bob Jones",
        "customer_email": "bob@example.com",
        "subject": "Billing issue",
        "description": "I was charged twice.",
    })
    ticket_id = create_res.json()["ticket_id"]

    # Mock call_gemini_api to simulate summary return
    with patch("app.services.ai_service.call_gemini_api") as mock_call:
        mock_call.return_value = (
            '{"summary": "Customer charged twice", '
            '"root_cause": "Billing portal system glitch", '
            '"suggested_action": "Initiate refund for second transaction"}'
        )
        
        response = client.post(f"/api/tickets/{ticket_id}/ai-summarize")
        assert response.status_code == 200, response.text
        data = response.json()
        assert data["summary"] == "Customer charged twice"
        assert data["root_cause"] == "Billing portal system glitch"
        assert data["suggested_action"] == "Initiate refund for second transaction"
        
        # Verify call arguments
        mock_call.assert_called_once()
        assert "Billing issue" in mock_call.call_args[0][0]
