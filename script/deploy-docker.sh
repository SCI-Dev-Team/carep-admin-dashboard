#!/bin/bash

# Deploy admin-dashboard to Docker on the same network as MySQL

set -e

echo "🐳 Deploying Admin Dashboard with Docker"
echo "========================================="

# 1. Stop and remove any existing PM2 instance
echo "🛑 Stopping PM2 instance (if running)..."
pm2 stop admin-dashboard 2>/dev/null || true
pm2 delete admin-dashboard 2>/dev/null || true

# 2. Stop and remove existing Docker container
echo "🛑 Stopping existing Docker container..."
docker stop admin-dashboard 2>/dev/null || true
docker rm admin-dashboard 2>/dev/null || true

# 3. Find the Docker network that MySQL is using
echo "🔍 Finding MySQL Docker network..."
MYSQL_CONTAINER=$(docker ps --filter "ancestor=mysql:8.0" --format "{{.Names}}" | head -n1)
if [ -z "$MYSQL_CONTAINER" ]; then
    echo "❌ MySQL container not found!"
    echo "Looking for any container named 'db' or 'cucumber_db'..."
    MYSQL_CONTAINER=$(docker ps --format "{{.Names}}" | grep -E "(^db$|cucumber_db)" | head -n1)
fi

if [ -z "$MYSQL_CONTAINER" ]; then
    echo "❌ Could not find MySQL container. Please ensure MySQL is running."
    exit 1
fi

NETWORK=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' "$MYSQL_CONTAINER" | head -n1)
echo "✅ Found MySQL container: $MYSQL_CONTAINER"
echo "✅ Using network: $NETWORK"

# 4. Ensure .env has correct DB_HOST
echo "📝 Checking .env configuration..."
if ! grep -q "^DB_HOST=" .env; then
    echo "❌ DB_HOST not found in .env"
    exit 1
fi

# Get the MySQL service name from docker network
MYSQL_SERVICE=$(docker inspect -f '{{.Config.Hostname}}' "$MYSQL_CONTAINER")
echo "MySQL service name: $MYSQL_SERVICE"

# Update DB_HOST in .env to match the container hostname or use container name
if [ "$MYSQL_SERVICE" != "db" ]; then
    echo "⚠️  Updating DB_HOST to $MYSQL_CONTAINER (container name)..."
    sed -i.bak "s/^DB_HOST=.*/DB_HOST=$MYSQL_CONTAINER/" .env
else
    echo "✅ DB_HOST already set to 'db'"
fi

# 5. Build the Docker image
echo "🔨 Building Docker image..."
docker build -t admin-dashboard .

# 6. Run the container on the same network
echo "🚀 Starting container..."
docker run -d \
  --name admin-dashboard \
  --network "$NETWORK" \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  admin-dashboard

# 7. Wait a moment and check status
sleep 3
docker ps | grep admin-dashboard || echo "⚠️  Container may have stopped"

echo ""
echo "========================================="
echo "✅ Deployment complete!"
echo "========================================="
echo ""
echo "Container: admin-dashboard"
echo "Network: $NETWORK"
echo "Port: 3000"
echo ""
echo "Useful commands:"
echo "  - View logs: docker logs -f admin-dashboard"
echo "  - Restart: docker restart admin-dashboard"
echo "  - Stop: docker stop admin-dashboard"
echo "  - Remove: docker rm -f admin-dashboard"
echo ""

