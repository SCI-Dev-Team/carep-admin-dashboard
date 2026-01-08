#!/bin/bash

# Production start script (without standalone mode)
# This serves static assets correctly

echo "🚀 Starting Admin Dashboard (Production)"
echo "========================================="

# Stop any running PM2 instances
pm2 stop admin-dashboard 2>/dev/null || true
pm2 delete admin-dashboard 2>/dev/null || true

# Kill any process on port 3000
PORT_PID=$(lsof -ti:3000)
if [ ! -z "$PORT_PID" ]; then
    echo "🛑 Stopping process on port 3000..."
    kill -9 $PORT_PID 2>/dev/null || true
fi

# Check if build is needed
if [ ! -d ".next" ]; then
    echo "📦 Building application..."
    npm run build
fi

# Start with PM2
if command -v pm2 &> /dev/null; then
    echo "🚀 Starting with PM2..."
    HOST=0.0.0.0 PORT=3000 pm2 start npm --name "admin-dashboard" -- start
    pm2 save
    echo "✅ Application started with PM2"
    echo ""
    echo "Useful commands:"
    echo "  - View logs: pm2 logs admin-dashboard"
    echo "  - Restart: pm2 restart admin-dashboard"
    echo "  - Stop: pm2 stop admin-dashboard"
    echo "  - Monitor: pm2 monit"
else
    echo "🚀 Starting with npm..."
    HOST=0.0.0.0 PORT=3000 npm start
fi

