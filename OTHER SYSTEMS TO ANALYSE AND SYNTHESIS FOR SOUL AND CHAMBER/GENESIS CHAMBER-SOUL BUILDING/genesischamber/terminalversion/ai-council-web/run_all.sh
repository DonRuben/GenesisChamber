#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}AI Expert Council Simulator${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check if backend is already running
if check_port 8000; then
    echo -e "${YELLOW}Backend already running on port 8000${NC}"
else
    echo -e "${GREEN}Starting backend server...${NC}"
    # Start backend in background
    gnome-terminal --title="AI Council Backend" -- bash -c "./run_backend.sh; exec bash" 2>/dev/null || \
    xterm -title "AI Council Backend" -e "./run_backend.sh" 2>/dev/null || \
    osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && ./run_backend.sh"' 2>/dev/null || \
    (./run_backend.sh &)
    
    # Wait for backend to start
    echo -e "${YELLOW}Waiting for backend to start...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:8000 > /dev/null; then
            echo -e "${GREEN}Backend is ready!${NC}"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            echo -e "${RED}Backend failed to start. Check the backend terminal for errors.${NC}"
            exit 1
        fi
    done
fi

# Check if frontend is already running
if check_port 3000; then
    echo -e "${YELLOW}Frontend already running on port 3000${NC}"
else
    echo -e "${GREEN}Starting frontend server...${NC}"
    # Start frontend in background
    gnome-terminal --title="AI Council Frontend" -- bash -c "./run_frontend.sh; exec bash" 2>/dev/null || \
    xterm -title "AI Council Frontend" -e "./run_frontend.sh" 2>/dev/null || \
    osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && ./run_frontend.sh"' 2>/dev/null || \
    (./run_frontend.sh &)
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Services Starting...${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}Backend API:${NC} http://localhost:8000"
echo -e "${BLUE}API Docs:${NC}    http://localhost:8000/docs"
echo -e "${BLUE}Frontend:${NC}    http://localhost:3000"
echo ""
echo -e "${YELLOW}Opening browser in 5 seconds...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop watching (services will continue running)${NC}"

# Wait a bit for everything to stabilize
sleep 5

# Try to open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v start &> /dev/null; then
    start http://localhost:3000
fi

# Keep script running to show status
echo ""
echo -e "${GREEN}Services are running. Press Ctrl+C to exit this monitor.${NC}"
echo -e "${YELLOW}Note: Services will continue running in their own terminals.${NC}"

# Trap Ctrl+C
trap 'echo -e "\n${YELLOW}Monitor stopped. Services still running in background.${NC}"; exit 0' INT

# Keep running
while true; do
    sleep 1
done