#!/bin/bash

# CorpFin360 Frontend Startup Script
# This script starts the frontend and checks backend connectivity

echo "🚀 Starting CorpFin360 Frontend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ and try again.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm version: $(npm -v)${NC}"

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check if .env exists, if not create from example
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        echo -e "${YELLOW}⚙️ Creating .env file from env.example...${NC}"
        cp env.example .env
        echo -e "${GREEN}✅ .env file created${NC}"
    else
        echo -e "${YELLOW}⚠️ No .env file found. Creating default .env...${NC}"
        cat > .env << EOF
# Backend Connection
REACT_APP_BACKEND_URL=http://localhost:5000

# Optional: Override default timeout (milliseconds)
REACT_APP_API_TIMEOUT=30000

# Optional: Health check interval (milliseconds)
REACT_APP_HEALTH_CHECK_INTERVAL=30000

# Optional: Enable debug logging
REACT_APP_DEBUG=true
EOF
        echo -e "${GREEN}✅ Default .env file created${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Check backend connectivity
echo -e "${BLUE}🔍 Checking backend connectivity...${NC}"

# Try to connect to backend
if command -v curl &> /dev/null; then
    BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>/dev/null)
    
    if [ "$BACKEND_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ Backend is running and healthy${NC}"
    else
        echo -e "${YELLOW}⚠️ Backend health check failed (HTTP $BACKEND_RESPONSE)${NC}"
        echo -e "${YELLOW}   Make sure the backend is running on port 5000${NC}"
        echo -e "${YELLOW}   You can start it with: cd backend && ./start.sh${NC}"
        echo ""
        echo -e "${BLUE}🔄 Starting frontend anyway... (backend can be started later)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ curl not available, skipping backend check${NC}"
    echo -e "${YELLOW}   Make sure the backend is running on port 5000${NC}"
fi

# Start the frontend
echo -e "${BLUE}🌐 Starting frontend development server...${NC}"
echo -e "${GREEN}✅ Frontend will be available at: http://localhost:5173${NC}"
echo -e "${BLUE}📱 Backend status will be displayed at the top of the page${NC}"
echo ""

# Start the development server
npm run dev
