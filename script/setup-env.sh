#!/bin/bash

# Interactive environment setup script

echo "🔧 Admin Dashboard - Environment Setup"
echo "======================================"
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

echo "Please provide the following configuration:"
echo ""

# Database Configuration
echo "📊 Database Configuration"
read -p "Database Host (default: 127.0.0.1): " db_host
db_host=${db_host:-127.0.0.1}

read -p "Database Port (default: 3306): " db_port
db_port=${db_port:-3306}

read -p "Database User: " db_user
read -sp "Database Password: " db_password
echo ""

read -p "Database Name: " db_name
echo ""

# Admin Configuration
echo "🔐 Admin Configuration"
read -p "Admin Username (default: admin): " admin_user
admin_user=${admin_user:-admin}

read -sp "Admin Password: " admin_pass
echo ""
read -sp "Confirm Admin Password: " admin_pass_confirm
echo ""

if [ "$admin_pass" != "$admin_pass_confirm" ]; then
    echo "❌ Passwords do not match!"
    exit 1
fi

echo ""
echo "📝 Creating .env file..."

# Create .env file
cat > .env << EOF
# Database Configuration
DB_HOST=$db_host
DB_PORT=$db_port
DB_USER=$db_user
DB_PASSWORD=$db_password
DB_NAME=$db_name

# Admin Authentication
ADMIN_USER=$admin_user
ADMIN_PASS=$admin_pass

# Optional Configuration
UPLOAD_COOLDOWN=10
MAX_DAILY_UPLOADS=40

# Node Environment
NODE_ENV=production
EOF

echo "✅ .env file created successfully!"
echo ""

# Test database connection
echo "🔍 Testing database connection..."
if command -v mysql &> /dev/null; then
    if mysql -h "$db_host" -P "$db_port" -u "$db_user" -p"$db_password" -e "USE $db_name;" 2>/dev/null; then
        echo "✅ Database connection successful!"
    else
        echo "⚠️  Could not connect to database. Please verify your credentials."
        echo "   You can test manually with: mysql -h $db_host -u $db_user -p"
    fi
else
    echo "⚠️  MySQL client not found. Skipping connection test."
fi

echo ""
echo "🎉 Setup complete! You can now:"
echo "   - Run development: npm run dev"
echo "   - Build for production: npm run build"
echo "   - Start production: npm start"
echo "   - Deploy with PM2: ./deploy.sh"
echo ""

