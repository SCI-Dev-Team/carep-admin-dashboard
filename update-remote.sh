#!/bin/bash

# Script to update code on remote GCP VM and restart the application

set -e

# Configuration
INSTANCE_NAME="instance-20251223-025206"
ZONE="us-central1-c"
REMOTE_PATH="~/carep-admin-dashboard"

echo "🚀 Updating CAREP Admin Dashboard on GCP VM"
echo "=============================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install Google Cloud SDK first."
    exit 1
fi

# Step 1: Upload updated files to VM
echo ""
echo "📤 Uploading updated files to VM..."
gcloud compute scp \
  --recurse \
  --compress \
  --zone="$ZONE" \
  ./* \
  "${INSTANCE_NAME}:${REMOTE_PATH}/" \
  --exclude=".git/*" \
  --exclude="node_modules/*" \
  --exclude=".next/*" \
  --exclude=".env"

echo "✅ Files uploaded successfully"

# Step 2: Rebuild and restart on VM
echo ""
echo "🔨 Rebuilding and restarting application on VM..."
gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --command="
  set -e
  cd $REMOTE_PATH
  
  echo '🛑 Stopping existing container...'
  docker stop admin-dashboard 2>/dev/null || true
  docker rm admin-dashboard 2>/dev/null || true
  
  echo '🏗️  Building new Docker image...'
  docker build -t admin-dashboard .
  
  echo '🚀 Starting new container...'
  # Find MySQL network
  MYSQL_CONTAINER=\$(docker ps --format '{{.Names}}' | grep -E '(^db$|mysql|cucumber)' | head -n1)
  if [ -z \"\$MYSQL_CONTAINER\" ]; then
    echo '❌ MySQL container not found'
    exit 1
  fi
  
  NETWORK=\$(docker inspect -f '{{range \$k,\$v := .NetworkSettings.Networks}}{{\$k}}{{end}}' \"\$MYSQL_CONTAINER\" | head -n1)
  echo \"Using network: \$NETWORK\"
  
  docker run -d \
    --name admin-dashboard \
    --network \"\$NETWORK\" \
    -p 3000:3000 \
    --env-file .env \
    --restart unless-stopped \
    admin-dashboard
  
  echo ''
  echo '✅ Container started successfully'
  sleep 2
  docker ps | grep admin-dashboard
"

echo ""
echo "=============================================="
echo "✅ Update completed successfully!"
echo "=============================================="
echo ""
echo "Application should now be running with updated code."
echo "Access it at: http://YOUR_EXTERNAL_IP:3000"
echo ""
echo "To check logs:"
echo "  gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --command='docker logs -f admin-dashboard'"
echo ""
