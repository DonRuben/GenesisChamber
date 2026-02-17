# === Genesis Chamber — Backend (Python FastAPI) ===
FROM python:3.10-slim

WORKDIR /app

# Install uv for fast dependency resolution
RUN pip install uv

# Copy dependency files first (cache layer)
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv pip install --system -r pyproject.toml

# Copy application code
COPY backend/ ./backend/
COPY souls/ ./souls/
COPY briefs/ ./briefs/

# Create runtime directories
RUN mkdir -p data/conversations output context

# Expose port (configurable via PORT env var)
EXPOSE 8001

# Run the backend
CMD ["python", "-m", "backend.main"]
