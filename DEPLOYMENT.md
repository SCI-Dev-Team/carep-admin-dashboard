# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ installed and running
- npm or yarn package manager

## Option 1: Manual Deployment

### 1. Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Configure the following variables:
- `DB_HOST`: Your MySQL host (default: 127.0.0.1)
- `DB_PORT`: MySQL port (default: 3306)
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `ADMIN_USER`: Admin dashboard username
- `ADMIN_PASS`: Admin dashboard password (use a strong password!)

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Application

```bash
npm run build
```

### 4. Start the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

---

## Option 2: Using Start Script

```bash
# Make the script executable
chmod +x start.sh

# Run the script
./start.sh
```

---

## Option 3: Using PM2 (Recommended for Production)

PM2 is a production process manager for Node.js applications.

### Install PM2

```bash
npm install -g pm2
```

### Deploy with PM2

```bash
# Make the deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### PM2 Commands

```bash
# View logs
pm2 logs admin-dashboard

# Restart application
pm2 restart admin-dashboard

# Stop application
pm2 stop admin-dashboard

# View monitoring dashboard
pm2 monit

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

---

## Option 4: Using Docker

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t admin-dashboard .

# Run the container
docker run -p 3000:3000 --env-file .env admin-dashboard
```

### Using Docker Compose (with MySQL)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Database Setup

1. Create the database:

```sql
CREATE DATABASE IF NOT EXISTS `db-name` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import your tables (analytics, cauliflower_diseases, cucumber_diseases)

3. Verify connection from the application

---

## Nginx Reverse Proxy (Optional)

If you want to serve the application through Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is setup automatically
```

---

## Monitoring and Maintenance

### Check Application Status

```bash
# With PM2
pm2 status

# Check Node.js process
ps aux | grep node
```

### View Application Logs

```bash
# PM2 logs
pm2 logs admin-dashboard --lines 100

# Docker logs
docker-compose logs -f admin-dashboard

# Manual deployment
# Check logs in the terminal where you started the app
```

### Backup Database

```bash
# Backup
mysqldump -u [username] -p [database_name] > backup_$(date +%Y%m%d).sql

# Restore
mysql -u [username] -p [database_name] < backup_20240108.sql
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 [PID]
```

### Database Connection Issues

1. Verify MySQL is running: `sudo systemctl status mysql`
2. Check credentials in `.env`
3. Ensure database user has proper permissions
4. Test connection: `mysql -u [user] -p -h [host] [database]`

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

## Security Recommendations

1. **Use Strong Passwords**: Set a strong `ADMIN_PASS` in `.env`
2. **Enable HTTPS**: Use SSL certificate for production
3. **Firewall**: Configure firewall to only allow necessary ports
4. **Regular Updates**: Keep dependencies updated
   ```bash
   npm audit
   npm audit fix
   ```
5. **Environment Variables**: Never commit `.env` to version control
6. **Database Security**: Use strong database passwords and limit access

---

## Performance Optimization

1. **Enable Compression** in Nginx
2. **Use CDN** for static assets
3. **Database Indexing**: Ensure proper indexes on frequently queried columns
4. **PM2 Cluster Mode**: Run multiple instances
   ```bash
   pm2 start ecosystem.config.js -i max
   ```

---

## Support

For issues or questions, check:
- Application logs
- Database connection
- Environment variables configuration
- Port availability

