# EthnoKG: Render Cloud Deployment Guide

This guide walks you through deploying **EthnoKG** to [Render](https://render.com) with automated builds, zero CORS friction, and production SQLite or PostgreSQL persistence.

---

## Method 1: Render Blueprint (Recommended — 1 Click)

EthnoKG includes a declarative [`render.yaml`](../render.yaml) specification in the root directory.

1. **Sign in to Render:** Go to [dashboard.render.com](https://dashboard.render.com).
2. **New + Blueprints:** Click **New +** in the top navigation bar and select **Blueprint**.
3. **Connect GitHub Repository:**
   - Select your repository: `https://github.com/vikassharma270907-alt/EthnoKG`
   - Branch: `main`
4. **Deploy Blueprint:**
   - Render reads `render.yaml` and provisions:
     - **Web Service:** `ethnokg-platform`
     - **Environment:** Docker (multi-stage build compiling React frontend and running FastAPI)
     - **Health Check Path:** `/api/health`
5. Click **Apply**.
6. Render builds the Docker container and assigns you a live public URL:  
   `https://ethnokg-platform.onrender.com`

---

## Method 2: Manual Web Service Setup (Docker)

If you prefer configuring the Web Service manually in the Render UI:

1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect the GitHub repository `https://github.com/vikassharma270907-alt/EthnoKG`.
3. Set the configuration:
   - **Name:** `ethnokg`
   - **Region:** Oregon (US West) or Frankfurt (EU)
   - **Branch:** `main`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Instance Type:** `Free`
4. Under **Advanced** $\rightarrow$ **Environment Variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `ENVIRONMENT` | `production` | Production mode |
   | `CORS_ORIGINS` | `["*"]` | Allows open API requests |
   | `DEFAULT_CONFIDENCE_THRESHOLD` | `0.75` | Minimum confidence score |
5. Set **Health Check Path:** `/api/health`.
6. Click **Create Web Service**.

---

## Method 3: Native Python & Node Build (Without Docker)

If you prefer Render's native Python runtime instead of Docker:

1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Set configuration:
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..
     ```
   - **Start Command:**
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```
3. Set Environment Variables:
   - `PYTHON_VERSION`: `3.11.9`
   - `NODE_VERSION`: `20.12.0`
   - `ENVIRONMENT`: `production`
   - `PYTHONPATH`: `/opt/render/project/src`

---

## Verifying the Deployment

Once Render finishes deploying:

1. **Frontend UI:** Open your Render URL `https://your-service.onrender.com/`. You should see the EthnoKG Research Dashboard with real-time graphs and navigation.
2. **API Health Check:** Visit `https://your-service.onrender.com/api/health`. It will return:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "service": "EthnoKG Backend",
     "environment": "production",
     "version": "1.0.0"
   }
   ```
3. **Interactive Swagger Docs:** Visit `https://your-service.onrender.com/docs` to test all REST endpoints.
4. **Discovery Radar API:** Visit `https://your-service.onrender.com/api/analytics/discovery-index` to verify Reverse Pharmacology calculations.
