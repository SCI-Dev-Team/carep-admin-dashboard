# Update Workflow for CAREP Admin Dashboard

## Why can't I just restart Docker?

Docker containers are built from **images**. When you change your source code locally, those changes are NOT in the Docker image until you **rebuild** it. Restarting only restarts the same old container with old code.

## Simple 3-Step Update Process

### Step 1: Upload changed files from your local machine

```bash
cd /Users/thun/Desktop/Project/sci-project/admin-dashbaord

# Upload specific changed files
gcloud compute scp \
  app/components/AnalyticsDashboard.tsx \
  app/components/AppShell.tsx \
  app/components/CauliCrud.tsx \
  app/layout.tsx \
  instance-20251223-025206:~/carep-admin-dashboard/app/components/ \
  --zone=us-central1-c

# OR upload everything (slower but safer)
gcloud compute scp --recurse \
  --exclude=".git/*" \
  --exclude="node_modules/*" \
  --exclude=".next/*" \
  ./* \
  instance-20251223-025206:~/carep-admin-dashboard/ \
  --zone=us-central1-c
```

### Step 2: SSH into the VM

```bash
gcloud compute ssh instance-20251223-025206 --zone=us-central1-c
```

### Step 3: Run the update script on the VM

```bash
cd ~/carep-admin-dashboard
chmod +x quick-update.sh
./quick-update.sh
```

Done! The script will:
- Stop old container
- Rebuild image with new code
- Start new container

---

## Alternative: One-Command Update (from local machine)

Use the automated script:

```bash
cd /Users/thun/Desktop/Project/sci-project/admin-dashbaord
chmod +x update-remote.sh
./update-remote.sh
```

This does all 3 steps automatically.

---

## For Development: Hot-Reload Setup (Optional)

If you want to make many changes and see them instantly without rebuilding:

### 1. Run with PM2 instead of Docker (on VM):

```bash
# On VM
cd ~/carep-admin-dashboard
pm2 stop admin-dashboard 2>/dev/null || true
docker stop admin-dashboard
npm install
npm run build
pm2 start npm --name "admin-dashboard" -- start
pm2 save
```

### 2. Edit files directly on VM:

```bash
# SSH into VM
gcloud compute ssh instance-20251223-025206 --zone=us-central1-c

# Edit files with nano or vim
nano ~/carep-admin-dashboard/app/components/AnalyticsDashboard.tsx

# Rebuild and restart
cd ~/carep-admin-dashboard
npm run build
pm2 restart admin-dashboard
```

---

## Quick Reference

| Method | Speed | Use Case |
|--------|-------|----------|
| `quick-update.sh` (Docker) | ~2-3 min | Production updates |
| `update-remote.sh` (automated) | ~3-4 min | Hands-off deployment |
| PM2 direct | ~30 sec | Rapid development |
| Edit on VM | Instant | Quick fixes |

---

## Troubleshooting

**Container won't start?**
```bash
docker logs admin-dashboard
```

**Check if it's running:**
```bash
docker ps | grep admin-dashboard
```

**Force clean rebuild:**
```bash
docker stop admin-dashboard && docker rm admin-dashboard
docker rmi admin-dashboard
./quick-update.sh
```
