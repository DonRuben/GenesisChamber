#!/bin/bash

# Genesis Chamber — Start Script
# Starts both backend (FastAPI) and frontend (Vite) for local development

set -e

echo "================================================"
echo "  Genesis Chamber — Starting Local Dev Servers"
echo "================================================"
echo ""

# Check .env exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Copy .env.example to .env and fill in your API keys:"
    echo "  cp .env.example .env"
    exit 1
fi

# Create runtime directories if missing
mkdir -p data/conversations output context

# Install backend deps if needed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "Installing backend dependencies..."
    pip install -r requirements.txt
fi

# Install frontend deps if needed
if [ ! -d frontend/node_modules ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Start backend
echo "Starting backend on http://localhost:8001..."
python -m backend.main &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend..."
for i in $(seq 1 10); do
    if curl -sf http://localhost:8001/ > /dev/null 2>&1; then
        echo "Backend ready!"
        break
    fi
    sleep 1
done

# Start frontend
echo "Starting frontend on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "================================================"
echo "  Genesis Chamber is running!"
echo ""
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:8001"
echo "  API Docs:  http://localhost:8001/docs"
echo "================================================"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
