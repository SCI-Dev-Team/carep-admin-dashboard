# GitHub Actions Workflows

## Weather Alerts Cron Job

This workflow automatically sends weather alerts to users every morning at 6:00 AM.

### Setup Instructions

1. **Add Required Secrets to Your GitHub Repository:**
   
   Go to your repository → Settings → Secrets and variables → Actions → New repository secret

   Required secrets:
   - `APP_URL`: Your deployed application URL (e.g., `https://your-app.vercel.app`)
   
   Optional secrets (for failure notifications):
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `TELEGRAM_ADMIN_CHAT_ID`: Admin chat ID for failure notifications

2. **Schedule Configuration:**

   The workflow is scheduled to run at **6:00 AM UTC** by default.
   
   - If you want **6:00 AM Cambodia Time (UTC+7)**, the cron should run at **23:00 UTC** (previous day)
   - Current setting: `0 6 * * *` (6:00 AM UTC = 1:00 PM Cambodia Time)
   - For 6:00 AM Cambodia Time, change to: `0 23 * * *`

   To change the schedule, edit `.github/workflows/weather-alerts-cron.yml`:
   ```yaml
   schedule:
     - cron: '0 23 * * *'  # 6:00 AM Cambodia Time (UTC+7)
   ```

3. **Manual Trigger:**

   You can manually trigger the workflow from the Actions tab in your GitHub repository:
   - Go to Actions → Weather Alerts Cron Job → Run workflow

4. **Monitoring:**

   - Check the Actions tab to see workflow runs
   - Failed runs will send a Telegram notification if configured
   - View logs for detailed information about sent alerts

### Cron Syntax Reference

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

Examples:
- `0 6 * * *` - Every day at 6:00 AM UTC
- `0 23 * * *` - Every day at 11:00 PM UTC (6:00 AM Cambodia Time)
- `0 6,18 * * *` - Every day at 6:00 AM and 6:00 PM UTC
- `0 */6 * * *` - Every 6 hours

### API Endpoint

The workflow calls: `PUT /api/weather/alerts?auto_send=true&target=all`

Parameters:
- `auto_send=true`: Automatically send alerts to users
- `target=all`: Send to all users (other options: `farmer_leads` or specific user IDs)

### How It Works

1. The workflow triggers at the scheduled time
2. Calls the weather alerts API endpoint
3. API checks for weather conditions exceeding thresholds
4. Filters out alerts already sent in the last 24 hours
5. Sends alerts to users in affected provinces via Telegram (text + voice)
6. Records sent alerts in the database
7. If the workflow fails, sends a notification to admin (if configured)
