// PM2 configuration file for production deployment
module.exports = {
  apps: [
    {
      name: "admin-dashboard",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      // Path to the admin dashboard on the instance
      cwd: "/home/rileywalker1303591858/carep-admin-dashboard",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      max_restarts: 5,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
        // Path to the bot project uploads folder
        UPLOADS_PATH: "/home/rileywalker1303591858/cucumber-tele-bot/uploads"
      },
      // Logging
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm Z"
    }
  ]
};
