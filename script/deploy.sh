#!/bin/bash

# Deployment script for Admin Dashboard

set -e

echo "🚀 Admin Dashboard Deployment Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Load environment variables
source .env

echo -e "${GREEN}✓${NC} Environment variables loaded"

# Stop any running instances
echo "🛑 Stopping any running instances..."
pm2 stop admin-dashboard 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Start with PM2 (if installed)
if command -v pm2 &> /dev/null; then
    echo "🚀 Starting with PM2..."
    pm2 start npm --name "admin-dashboard" -- start
    pm2 save
    echo -e "${GREEN}✓${NC} Application started with PM2"
    echo "Use 'pm2 logs admin-dashboard' to view logs"
else
    echo -e "${YELLOW}⚠${NC}  PM2 not found. Starting with npm..."
    echo "For production, consider installing PM2: npm install -g pm2"
    npm start &
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Application is running on http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  - View logs: pm2 logs admin-dashboard"
echo "  - Restart: pm2 restart admin-dashboard"
echo "  - Stop: pm2 stop admin-dashboard"
echo "  - Monitor: pm2 monit"

