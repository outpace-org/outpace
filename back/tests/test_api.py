from fastapi.testclient import TestClient
from sql_app.api import app, get_db
from .db_setup import setup_function

TestSessionLocal = setup_function()


def override_get_db():
    try:
        db = TestSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_get_dashboard():

    response = client.get("/dashboard/53012872")
    content = response.json()

    assert content["name"] == "Tom Dem"
    assert response.status_code == 200

    response = client.get("/dashboard/95047171")
    content = response.json()

    assert content["name"] == "Roman Bessouat"
    assert response.status_code == 200

    response = client.get("/dashboard/999")
    assert response.status_code == 404

def test_get_activities():
    response = client.get("/activities/53012872")
    content = response.json()

    assert len(content) == 153
    assert response.status_code == 200

    response = client.get("/activities/999")
    assert response.json() == []





