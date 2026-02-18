module.exports = {
  apps: [
    {
      name: "admin-dashbaord",
      // Use the Next.js start script from the admin-dashbaord package
      script: "npm",
      args: "start",
      cwd: "/home/rileywalker1303591858/cucumber-tele-bot/admin-dashbaord",
      env: {
        NODE_ENV: "production",
        // Absolute path to uploads on the host machine (read-only is fine)
        UPLOADS_PATH: "/home/rileywalker1303591858/cucumber-tele-bot/uploads"
      },
      // Recommended: set autorestart and max_restarts
      autorestart: true,
      watch: false,
      max_restarts: 5,
      // Logging (optional)
      error_file: "/var/log/admin-dashbaord-error.log",
      out_file: "/var/log/admin-dashbaord-out.log",
      log_date_format: "YYYY-MM-DD HH:mm Z"
    }
  ]
};
// PM2 configuration file for production deployment

module.exports = {
  apps: [
    {
      name: 'admin-dashboard',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};

