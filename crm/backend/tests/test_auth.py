def test_auth_flow(client) -> None:
    # 1. Signup new customer user
    signup_res = client.post("/api/auth/signup", json={
        "email": "testuser@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
        "role": "customer"
    })
    assert signup_res.status_code == 201
    assert signup_res.json()["email"] == "testuser@example.com"
    assert signup_res.json()["role"] == "customer"

    # 2. Login
    login_res = client.post("/api/auth/login", json={
        "email": "testuser@example.com",
        "password": "testpassword123"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 3. Get /me with Authorization header
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "testuser@example.com"


def test_auth_route_protections(client) -> None:
    # 1. Access tickets without token (should fail)
    response = client.get("/api/tickets")
    assert response.status_code == 401

    # 2. Signup an admin user
    client.post("/api/auth/signup", json={
        "email": "admin2@crm.com",
        "password": "adminpassword",
        "full_name": "Admin Two",
        "role": "admin"
    })

    # Login admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin2@crm.com",
        "password": "adminpassword"
    })
    admin_token = login_res.json()["access_token"]

    # 3. Signup a customer user
    client.post("/api/auth/signup", json={
        "email": "customer2@example.com",
        "password": "customerpassword",
        "full_name": "Customer Two",
        "role": "customer"
    })

    # Login customer
    login_res2 = client.post("/api/auth/login", json={
        "email": "customer2@example.com",
        "password": "customerpassword"
    })
    customer_token = login_res2.json()["access_token"]

    # 4. Customer tries to access dashboard (should return 403 Forbidden)
    dash_res = client.get(
        "/api/dashboard",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert dash_res.status_code == 403

    # 5. Admin accesses dashboard (should succeed 200)
    dash_res_admin = client.get(
        "/api/dashboard",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert dash_res_admin.status_code == 200
