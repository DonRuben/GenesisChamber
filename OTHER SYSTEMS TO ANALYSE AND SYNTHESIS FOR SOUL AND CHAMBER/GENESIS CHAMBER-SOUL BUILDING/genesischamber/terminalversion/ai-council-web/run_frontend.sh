#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AI Expert Council Frontend...${NC}"

# Navigate to frontend directory
cd frontend || { echo -e "${RED}Frontend directory not found!${NC}"; exit 1; }

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed! Please install Node.js first.${NC}"
    exit 1
fi

# Always check and update dependencies
echo -e "${YELLOW}Checking and installing dependencies...${NC}"

# Check if package-lock.json has changed or node_modules is missing
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ] || [ "package-lock.json" -nt "node_modules" ]; then
    echo -e "${YELLOW}Installing/updating npm packages...${NC}"
    npm install || { echo -e "${RED}Failed to install dependencies!${NC}"; exit 1; }
else
    # Quick check for any missing dependencies
    npm install --no-save --quiet || { echo -e "${RED}Failed to install dependencies!${NC}"; exit 1; }
fi

echo -e "${GREEN}Dependencies ready${NC}"

# Check if backend is running
echo -e "${YELLOW}Checking if backend is running...${NC}"
if curl -s http://localhost:8000 > /dev/null; then
    echo -e "${GREEN}Backend is running ✓${NC}"
else
    echo -e "${RED}Warning: Backend doesn't seem to be running on http://localhost:8000${NC}"
    echo -e "${YELLOW}Please run ./run_backend.sh in another terminal first${NC}"
    echo ""
fi

# Start the frontend server
echo -e "${GREEN}Starting Next.js development server...${NC}"
echo -e "${BLUE}Frontend will be available at http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Run Next.js dev server
npm run dev