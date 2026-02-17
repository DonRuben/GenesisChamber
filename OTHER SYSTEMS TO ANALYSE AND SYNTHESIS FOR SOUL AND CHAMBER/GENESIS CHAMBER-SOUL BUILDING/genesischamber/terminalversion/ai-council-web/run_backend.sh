#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AI Expert Council Backend...${NC}"

# Navigate to backend directory
cd backend || { echo -e "${RED}Backend directory not found!${NC}"; exit 1; }

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv || { echo -e "${RED}Failed to create virtual environment!${NC}"; exit 1; }
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate || { echo -e "${RED}Failed to activate virtual environment!${NC}"; exit 1; }

# Always update dependencies to ensure everything is installed
echo -e "${YELLOW}Checking and installing dependencies...${NC}"
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet || { echo -e "${RED}Failed to install dependencies!${NC}"; exit 1; }
echo -e "${GREEN}Dependencies ready${NC}"

# Start the backend server
echo -e "${GREEN}Starting FastAPI server on http://localhost:8000${NC}"
echo -e "${GREEN}API docs available at http://localhost:8000/docs${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Run uvicorn with reload for development
uvicorn main:app --reload --host 0.0.0.0 --port 8000