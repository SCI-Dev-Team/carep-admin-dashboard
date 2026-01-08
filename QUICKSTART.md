# Quick Start Guide

## 🚀 Fast Setup (5 minutes)

### 1. Clone and Install

```bash
cd /Users/thun/Desktop/Project/sci-project/admin-dashbaord
npm install
```

### 2. Create Environment File

Create a `.env` file in the project root:

```bash
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name

# Admin Authentication
ADMIN_USER=admin
ADMIN_PASS=your_secure_password
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 📦 Production Deployment

### Option A: Simple Script

```bash
chmod +x start.sh
./start.sh
```

### Option B: PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Deploy
chmod +x deploy.sh
./deploy.sh
```

### Option C: Docker

```bash
docker-compose up -d
```

---

## 🔐 Default Login

- **Username**: Set in `.env` as `ADMIN_USER`
- **Password**: Set in `.env` as `ADMIN_PASS`

---

## 📊 Features

- ✅ Analytics Dashboard with filtering
- ✅ Disease Management CRUD
- ✅ CSV Export
- ✅ User Activity Tracking
- ✅ Responsive Design
- ✅ Authentication System

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# PM2 Management
pm2 status
pm2 logs admin-dashboard
pm2 restart admin-dashboard
pm2 stop admin-dashboard
```

---

## 📝 Folder Structure

```
admin-dashbaord/
├── app/
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── public/               # Static files
├── .env                  # Environment variables (create this)
├── .env.example          # Example env file (blocked by gitignore)
├── start.sh              # Start script
├── deploy.sh             # Deployment script
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose
├── ecosystem.config.js   # PM2 configuration
└── DEPLOYMENT.md         # Full deployment guide
```

---

## 🆘 Troubleshooting

### Can't connect to database?
1. Check MySQL is running: `sudo systemctl status mysql`
2. Verify credentials in `.env`
3. Test connection: `mysql -u [user] -p -h [host]`

### Port 3000 already in use?
```bash
lsof -i :3000
kill -9 [PID]
```

### Build errors?
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 📚 Documentation

- Full deployment guide: See `DEPLOYMENT.md`
- Next.js docs: https://nextjs.org/docs
- MySQL docs: https://dev.mysql.com/doc/

---

## 🔒 Security Notes

1. **Never commit `.env`** to version control
2. **Use strong passwords** for `ADMIN_PASS`
3. **Enable HTTPS** in production
4. **Regular updates**: Run `npm audit` and `npm audit fix`
5. **Firewall**: Only expose necessary ports

---

## 🎉 You're Ready!

Your dashboard should now be running. Access it at:
- Development: `http://localhost:3000`
- Production: `http://your-server-ip:3000`

For production with domain and SSL, see `DEPLOYMENT.md` for Nginx and SSL setup.

