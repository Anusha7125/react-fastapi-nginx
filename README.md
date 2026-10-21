# Q7 — React + FastAPI + Nginx

## Project Overview
This project implements a Dockerized API Health Monitoring Dashboard using React, FastAPI, Nginx, and PostgreSQL.

It demonstrates containerization, reverse proxy configuration, service-to-service communication, and persistent database storage using Docker Compose.

## Technology Stack
- Frontend: React
- Backend: Python FastAPI
- Web server and reverse proxy: Nginx
- Database: PostgreSQL
- Containerization: Docker and Docker Compose

## Architecture
- Nginx serves the React frontend at `/`.
- Nginx forwards `/api/` requests to the FastAPI backend.
- FastAPI connects to PostgreSQL using the Docker Compose service name `db`.
- PostgreSQL stores health-check history in a persistent Docker volume.
- Only Nginx publishes a host port: `80`.

## Application Endpoints
- Dashboard: `http://localhost/`
- API health: `http://localhost/api/health`
- Health history: `http://localhost/api/history`

## Run the Project
Prerequisites: Docker Desktop and Docker Compose.

From the project root, run:

```powershell
docker compose up --build -d
```

Check container status:

```powershell
docker compose ps
```

View logs:

```powershell
docker compose logs
```

Stop the application:

```powershell
docker compose down
```

## Verification
The following checks were successful:
- Frontend returned HTTP 200.
- The health endpoint returned `healthy`.
- The API reported the database as `connected`.
- The history endpoint returned health-check records.
- Nginx published port 80; backend port 8000 and database port 5432 were not published to the host.

## Assignment
- Part 1 — Python + React
- Question 7 — React + FastAPI + Nginx
