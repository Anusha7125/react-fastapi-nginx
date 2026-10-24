import os
from datetime import datetime, timezone

import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Q7 - API Dashboard")


# CORS configuration for local and deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://q7-react-frontend.onrender.com",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


# PostgreSQL database connection
def get_connection():
    return psycopg.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "apidashboard"),
        user=os.getenv("DB_USER", "appuser"),
        password=os.getenv("DB_PASSWORD", "devpassword123"),
    )


# Create the health-check history table
@app.on_event("startup")
def create_tables():
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS health_checks (
                id SERIAL PRIMARY KEY,
                status VARCHAR(30) NOT NULL,
                checked_at TIMESTAMPTZ NOT NULL
            )
            """
        )


# Root endpoint
@app.get("/")
def home():
    return {
        "message": "Q7 API Dashboard backend is running"
    }


# Health-check endpoint
@app.get("/api/health")
def health():
    try:
        with get_connection() as conn:
            conn.execute(
                """
                INSERT INTO health_checks (status, checked_at)
                VALUES (%s, %s)
                """,
                ("healthy", datetime.now(timezone.utc)),
            )

        return {
            "status": "healthy",
            "database": "connected",
        }

    except psycopg.Error as exc:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed",
        ) from exc


# Retrieve the latest 20 health checks
@app.get("/api/history")
def history():
    try:
        with get_connection() as conn:
            rows = conn.execute(
                """
                SELECT id, status, checked_at
                FROM health_checks
                ORDER BY id DESC
                LIMIT 20
                """
            ).fetchall()

        return {
            "checks": [
                {
                    "id": row[0],
                    "status": row[1],
                    "checked_at": row[2].isoformat(),
                }
                for row in rows
            ]
        }

    except psycopg.Error as exc:
        raise HTTPException(
            status_code=503,
            detail="Could not retrieve health history",
        ) from exc