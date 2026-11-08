# ========================================================
# EthnoKG Backend Production Dockerfile
# ========================================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system build dependencies for psycopg2 and compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final lightweight production image
FROM python:3.11-slim

WORKDIR /app

# Install runtime PostgreSQL client library
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy application source
COPY . /app

# Ensure Python output is unbuffered
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Start Uvicorn bound to 0.0.0.0 and dynamic $PORT with 8000 default
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
