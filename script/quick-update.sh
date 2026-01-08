#!/bin/bash

# Quick update script - Run this ON THE VM after uploading new files

set -e

echo "🔄 Quick Update - CAREP Admin Dashboard"
echo "========================================"

cd ~/carep-admin-dashboard

# Stop old container
echo "🛑 Stopping old container..."
docker stop admin-dashboard 2>/dev/null || true
docker rm admin-dashboard 2>/dev/null || true

# Rebuild image
echo "🏗️  Rebuilding Docker image..."
docker build -t admin-dashboard .

# Find MySQL network and restart
echo "🚀 Starting new container..."
MYSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '(^db$|mysql|cucumber)' | head -n1)
NETWORK=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' "$MYSQL_CONTAINER" | head -n1)

docker run -d \
  --name admin-dashboard \
  --network "$NETWORK" \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  admin-dashboard

echo ""
echo "✅ Update complete!"
docker logs admin-dashboard --tail 20
