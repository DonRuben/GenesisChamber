# === Genesis Chamber — Backend (Python FastAPI) ===
FROM python:3.11-slim

WORKDIR /app

# Copy dependency files first (cache layer)
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

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
