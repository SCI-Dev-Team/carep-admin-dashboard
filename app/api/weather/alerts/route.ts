import { NextResponse } from 'next/server';

// Area ID to province name mapping
const areaMapping: { [key: number]: string } = {
  1: 'ភ្នំពេញ',
  2: 'កណ្ដាល',
  3: 'ព្រៃវែង',
  4: 'ស្វាយរៀង',
  5: 'កំពង់ចាម',
  6: 'ត្បូងឃ្មុំ',
  7: 'កំពង់ឆ្នាំង',
  8: 'កំពង់ធំ',
  9: 'កំពង់ស្ពឺ',
  10: 'តាកែវ',
  11: 'កំពត',
  12: 'កែប',
  13: 'ព្រះសីហនុ',
  14: 'កោះកុង',
  15: 'បាត់ដំបង',
  16: 'បន្ទាយមានជ័យ',
  17: 'សៀមរាប',
  18: 'ឧត្ដរមានជ័យ',
  19: 'ព្រះវិហារ',
  20: 'ស្ទឹងត្រែង',
  21: 'រតនគិរី',
  22: 'មណ្ឌលគិរី',
  23: 'ក្រចេះ',
  24: 'បុរីជុំ',
  32: 'ប៉ៃលិន',
};

const areaEnglishMapping: { [key: number]: string } = {
  1: 'Phnom Penh',
  2: 'Kandal',
  3: 'Prey Veng',
  4: 'Svay Rieng',
  5: 'Kampong Cham',
  6: 'Tbong Khmum',
  7: 'Kampong Chhnang',
  8: 'Kampong Thom',
  9: 'Kampong Speu',
  10: 'Takeo',
  11: 'Kampot',
  12: 'Kep',
  13: 'Preah Sihanouk',
  14: 'Koh Kong',
  15: 'Battambang',
  16: 'Banteay Meanchey',
  17: 'Siem Reap',
  18: 'Oddar Meanchey',
  19: 'Preah Vihear',
  20: 'Stung Treng',
  21: 'Ratanakiri',
  22: 'Mondulkiri',
  23: 'Kratie',
  24: 'Pursat',
  32: 'Pailin',
};

// Alert thresholds
const THRESHOLDS = {
  HIGH_HEAT: 35,           // temp >= 35
  // Only match severe rain conditions (thunderstorm, heavy rain, rain showers)
  HEAVY_RAIN_KEYWORDS: ['thunderstorm', 'heavy rain', 'rain showers', 'rain moderate', 'ព្យុះ', 'ភ្លៀងធ្លាក់ខ្លាំង'],
  // Light rain conditions (for info only, not alerts)
  LIGHT_RAIN_KEYWORDS: ['drizzle', 'slight', 'light rain', 'occasionnal', 'ភ្លៀងតិចតួច'],
  STRONG_WIND: 30,         // wind_speed >= 30
  HIGH_HUMIDITY: 85,       // humidity >= 85
  HIGH_TEMP_HUMIDITY: 30,  // temp >= 30 (for fungal risk)
  CO_DANGER: 2000,         // CO >= 2000
  SO2_DANGER: 40,          // SO2 >= 40
};

// Alert types with Khmer translations
const ALERT_TYPES = {
  HIGH_HEAT: {
    type: 'high_heat',
    title_en: '🌡️ High Heat Risk',
    title_kh: '🌡️ ការព្រមានកម្ដៅខ្ពស់',
    message_en: 'Temperature is very high. Stay hydrated and avoid prolonged sun exposure.',
    message_kh: 'សីតុណ្ហភាពខ្ពស់ខ្លាំង។ សូមផឹកទឹកឱ្យបានគ្រប់គ្រាន់ និងជៀសវាងការប៉ះពាល់កម្ដៅថ្ងៃយូរ។',
    severity: 'warning',
  },
  HEAVY_RAIN: {
    type: 'heavy_rain',
    title_en: '🌧️ Heavy Rain Warning',
    title_kh: '🌧️ ការព្រមានភ្លៀងធ្លាក់ខ្លាំង',
    message_en: 'Heavy rain expected. Protect crops and avoid flooded areas.',
    message_kh: 'រំពឹងថានឹងមានភ្លៀងធ្លាក់ខ្លាំង។ សូមការពារដំណាំ និងជៀសវាងតំបន់ជន់លិច។',
    severity: 'danger',
  },
  STRONG_WIND: {
    type: 'strong_wind',
    title_en: '💨 Strong Wind Warning',
    title_kh: '💨 ការព្រមានខ្យល់បក់ខ្លាំង',
    message_en: 'Strong winds expected. Secure loose items and protect fragile crops.',
    message_kh: 'រំពឹងថានឹងមានខ្យល់បក់ខ្លាំង។ សូមរំលាស់វត្ថុផ្សេងៗ និងការពារដំណាំ។',
    severity: 'warning',
  },
  FUNGAL_DISEASE_RISK: {
    type: 'fungal_disease_risk',
    title_en: '🍄 High Fungal Disease Risk',
    title_kh: '🍄 ការព្រមានហានិភ័យជំងឺផ្សិត',
    message_en: 'High humidity and temperature create ideal conditions for fungal diseases. Monitor crops closely.',
    message_kh: 'សំណើម និងសីតុណ្ហភាពខ្ពស់បង្កើតលក្ខខណ្ឌល្អសម្រាប់ជំងឺផ្សិត។ សូមតាមដានដំណាំឱ្យបានជិតស្និទ្ធ។',
    severity: 'warning',
  },
  AIR_POLLUTION: {
    type: 'air_pollution',
    title_en: '😷 Air Pollution Risk',
    title_kh: '😷 ការព្រមានការបំពុលខ្យល់',
    message_en: 'Air quality is poor. Limit outdoor activities and wear masks if necessary.',
    message_kh: 'គុណភាពខ្យល់មិនល្អ។ សូមកាត់បន្ថយសកម្មភាពក្រៅផ្ទះ និងពាក់ម៉ាសវេជ្ជសាស្ត្រប្រសិនបើចាំបាច់។',
    severity: 'danger',
  },
};

interface WeatherData {
  area_id: number;
  temperature: string | number;
  humidity: string | number;
  wind_speed: string | number;
  weather_value: string;
  forecast_date: string;
  period: string;
}

interface AirQualityData {
  area_id: number;
  co: number;
  so2: number;
  dust: number;
  forecast_date: string;
  forecast_hour: number;
}

interface Alert {
  id: string;
  type: string;
  title_en: string;
  title_kh: string;
  message_en: string;
  message_kh: string;
  severity: string;
  area_id: number;
  province_en: string;
  province_kh: string;
  forecast_date: string;
  value?: number | string;
  threshold?: number | string;
  created_at: string;
}

// Check weather conditions and generate alerts
function checkWeatherAlerts(weatherData: WeatherData[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();
  
  for (const data of weatherData) {
    const temp = parseFloat(String(data.temperature));
    const humidity = parseFloat(String(data.humidity));
    const windSpeed = parseFloat(String(data.wind_speed));
    const weatherValue = (data.weather_value || '').toLowerCase();
    
    const areaId = data.area_id;
    const provinceEn = areaEnglishMapping[areaId] || `Area ${areaId}`;
    const provinceKh = areaMapping[areaId] || `តំបន់ ${areaId}`;

    // High Heat Risk: temp >= 35
    if (temp >= THRESHOLDS.HIGH_HEAT) {
      alerts.push({
        id: `heat-${areaId}-${data.forecast_date}-${data.period}`,
        ...ALERT_TYPES.HIGH_HEAT,
        area_id: areaId,
        province_en: provinceEn,
        province_kh: provinceKh,
        forecast_date: data.forecast_date,
        value: temp,
        threshold: THRESHOLDS.HIGH_HEAT,
        created_at: now,
      });
    }

    // Heavy Rain Warning: weather_value contains heavy rain keywords but NOT light rain
    const isLightRain = THRESHOLDS.LIGHT_RAIN_KEYWORDS.some(keyword => 
      weatherValue.includes(keyword.toLowerCase())
    );
    const isHeavyRain = !isLightRain && THRESHOLDS.HEAVY_RAIN_KEYWORDS.some(keyword => 
      weatherValue.includes(keyword.toLowerCase())
    );
    if (isHeavyRain) {
      alerts.push({
        id: `rain-${areaId}-${data.forecast_date}-${data.period}`,
        ...ALERT_TYPES.HEAVY_RAIN,
        area_id: areaId,
        province_en: provinceEn,
        province_kh: provinceKh,
        forecast_date: data.forecast_date,
        value: data.weather_value,
        threshold: 'Heavy rain detected',
        created_at: now,
      });
    }

    // Strong Wind Warning: wind_speed >= 30
    if (windSpeed >= THRESHOLDS.STRONG_WIND) {
      alerts.push({
        id: `wind-${areaId}-${data.forecast_date}-${data.period}`,
        ...ALERT_TYPES.STRONG_WIND,
        area_id: areaId,
        province_en: provinceEn,
        province_kh: provinceKh,
        forecast_date: data.forecast_date,
        value: windSpeed,
        threshold: THRESHOLDS.STRONG_WIND,
        created_at: now,
      });
    }

    // Fungal Disease Risk: humidity >= 85 AND temp >= 30
    if (humidity >= THRESHOLDS.HIGH_HUMIDITY && temp >= THRESHOLDS.HIGH_TEMP_HUMIDITY) {
      alerts.push({
        id: `fungal-${areaId}-${data.forecast_date}-${data.period}`,
        ...ALERT_TYPES.FUNGAL_DISEASE_RISK,
        area_id: areaId,
        province_en: provinceEn,
        province_kh: provinceKh,
        forecast_date: data.forecast_date,
        value: `Humidity: ${humidity}%, Temp: ${temp}°C`,
        threshold: `Humidity >= ${THRESHOLDS.HIGH_HUMIDITY}% AND Temp >= ${THRESHOLDS.HIGH_TEMP_HUMIDITY}°C`,
        created_at: now,
      });
    }
  }

  return alerts;
}

// Check air quality and generate alerts
function checkAirQualityAlerts(airQualityData: AirQualityData[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  for (const data of airQualityData) {
    const co = data.co;
    const so2 = data.so2;
    const areaId = data.area_id;
    const provinceEn = areaEnglishMapping[areaId] || `Area ${areaId}`;
    const provinceKh = areaMapping[areaId] || `តំបន់ ${areaId}`;

    // Air Pollution Risk: CO >= 2000 OR SO2 >= 40
    if (co >= THRESHOLDS.CO_DANGER || so2 >= THRESHOLDS.SO2_DANGER) {
      const pollutant = co >= THRESHOLDS.CO_DANGER ? 'CO' : 'SO2';
      const value = co >= THRESHOLDS.CO_DANGER ? co : so2;
      const threshold = co >= THRESHOLDS.CO_DANGER ? THRESHOLDS.CO_DANGER : THRESHOLDS.SO2_DANGER;

      alerts.push({
        id: `pollution-${areaId}-${data.forecast_date}-${data.forecast_hour}`,
        ...ALERT_TYPES.AIR_POLLUTION,
        area_id: areaId,
        province_en: provinceEn,
        province_kh: provinceKh,
        forecast_date: data.forecast_date,
        value: `${pollutant}: ${value.toFixed(2)}`,
        threshold: `${pollutant} >= ${threshold}`,
        created_at: now,
      });
    }
  }

  return alerts;
}

// Database helper
async function withPool<T>(fn: (pool: any) => Promise<T>) {
  const mysql = await import('mysql2/promise');
  const pool = mysql.createPool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
    waitForConnections: true,
    connectionLimit: 5,
    connectTimeout: 10000,
    acquireTimeout: 10000,
  });
  try {
    return await fn(pool);
  } finally {
    await pool.end();
  }
}

// Send Telegram notification
async function sendTelegramMessage(chatId: string, message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

// GET: Check current alerts or get alert history
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'check';

  try {
    if (action === 'check') {
      // Fetch weather and air quality data
      const weatherUrl = process.env.WEATHER_API_BASE_URL || 'https://weather-scraper-8m4z.vercel.app/api/weather';
      const airQualityUrl = process.env.AIR_QUALITY_API_URL || 'https://weather-scraper-8m4z.vercel.app/api/windy/air-quality';

      const [weatherResponse, airQualityResponse] = await Promise.all([
        fetch(weatherUrl, { next: { revalidate: 0 } }),
        fetch(airQualityUrl, { next: { revalidate: 0 } }),
      ]);

      const weatherJson = await weatherResponse.json();
      const airQualityJson = await airQualityResponse.json();

      const weatherData = weatherJson.data || weatherJson;
      const airQualityData = airQualityJson.data || airQualityJson;

      // Check for alerts
      const weatherAlerts = checkWeatherAlerts(weatherData.hourly || []);
      const airQualityAlerts = checkAirQualityAlerts(Array.isArray(airQualityData) ? airQualityData : []);

      // Deduplicate alerts by area and type (keep one per area per type)
      const uniqueAlerts = new Map<string, Alert>();
      [...weatherAlerts, ...airQualityAlerts].forEach(alert => {
        const key = `${alert.type}-${alert.area_id}-${alert.forecast_date}`;
        if (!uniqueAlerts.has(key)) {
          uniqueAlerts.set(key, alert);
        }
      });

      const allAlerts = Array.from(uniqueAlerts.values());

      return NextResponse.json({
        success: true,
        alerts: allAlerts,
        summary: {
          total: allAlerts.length,
          high_heat: allAlerts.filter(a => a.type === 'high_heat').length,
          heavy_rain: allAlerts.filter(a => a.type === 'heavy_rain').length,
          strong_wind: allAlerts.filter(a => a.type === 'strong_wind').length,
          fungal_disease_risk: allAlerts.filter(a => a.type === 'fungal_disease_risk').length,
          air_pollution: allAlerts.filter(a => a.type === 'air_pollution').length,
        },
        thresholds: THRESHOLDS,
        checked_at: new Date().toISOString(),
      });
    }

    if (action === 'history') {
      // Get sent alert history from database
      const limit = Number(searchParams.get('limit') ?? 50);
      const offset = Number(searchParams.get('offset') ?? 0);

      const result = await withPool(async (pool) => {
        // Create table if not exists
        await pool.query(`
          CREATE TABLE IF NOT EXISTS weather_alerts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            alert_type VARCHAR(50) NOT NULL,
            area_id INT NOT NULL,
            province_en VARCHAR(100),
            province_kh VARCHAR(100),
            title_en VARCHAR(255),
            title_kh VARCHAR(255),
            message_en TEXT,
            message_kh TEXT,
            severity VARCHAR(20),
            value VARCHAR(255),
            threshold VARCHAR(255),
            forecast_date DATE,
            users_notified INT DEFAULT 0,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_alert_type (alert_type),
            INDEX idx_area_id (area_id),
            INDEX idx_sent_at (sent_at)
          )
        `);

        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM weather_alerts');
        const total = (countResult as any[])[0]?.total || 0;

        const [rows] = await pool.query(
          'SELECT * FROM weather_alerts ORDER BY sent_at DESC LIMIT ? OFFSET ?',
          [limit, offset]
        );

        return { history: rows, total };
      });

      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Weather alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to check weather alerts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST: Send alerts to users
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { alerts, target_users } = body;

    if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
      return NextResponse.json({ error: 'No alerts provided' }, { status: 400 });
    }

    // target_users: 'all' | 'farmer_leads' | number[] (specific user IDs)
    const targetType = target_users || 'all';

    const results = await withPool(async (pool) => {
      // Create alerts table if not exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS weather_alerts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          alert_type VARCHAR(50) NOT NULL,
          area_id INT NOT NULL,
          province_en VARCHAR(100),
          province_kh VARCHAR(100),
          title_en VARCHAR(255),
          title_kh VARCHAR(255),
          message_en TEXT,
          message_kh TEXT,
          severity VARCHAR(20),
          value VARCHAR(255),
          threshold VARCHAR(255),
          forecast_date DATE,
          users_notified INT DEFAULT 0,
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_alert_type (alert_type),
          INDEX idx_area_id (area_id),
          INDEX idx_sent_at (sent_at)
        )
      `);

      // Get target users
      let users: any[];
      if (Array.isArray(targetType)) {
        const placeholders = targetType.map(() => '?').join(',');
        const [rows] = await pool.query(
          `SELECT user_id, telegram_chat_id, location FROM users WHERE user_id IN (${placeholders})`,
          targetType
        );
        users = rows as any[];
      } else if (targetType === 'farmer_leads') {
        const [rows] = await pool.query(
          `SELECT user_id, telegram_chat_id, location FROM users WHERE role = 'farmer_lead'`
        );
        users = rows as any[];
      } else {
        // All users
        const [rows] = await pool.query(
          `SELECT user_id, telegram_chat_id, location FROM users`
        );
        users = rows as any[];
      }

      const sendResults: { alertId: string; sentCount: number; failedCount: number }[] = [];

      for (const alert of alerts as Alert[]) {
        let sentCount = 0;
        let failedCount = 0;

        // Format message with bilingual content
        const message = `<b>${alert.title_kh}</b>\n${alert.title_en}\n\n` +
          `📍 ${alert.province_kh} / ${alert.province_en}\n` +
          `📅 ${alert.forecast_date}\n\n` +
          `${alert.message_kh}\n\n` +
          `${alert.message_en}\n\n` +
          `⚠️ ${alert.value}`;

        // Send to each user
        for (const user of users) {
          const chatId = user.telegram_chat_id || user.user_id.toString();
          const success = await sendTelegramMessage(chatId, message);
          if (success) {
            sentCount++;
          } else {
            failedCount++;
          }
        }

        // Record the alert in database
        await pool.query(
          `INSERT INTO weather_alerts 
           (alert_type, area_id, province_en, province_kh, title_en, title_kh, message_en, message_kh, severity, value, threshold, forecast_date, users_notified)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            alert.type,
            alert.area_id,
            alert.province_en,
            alert.province_kh,
            alert.title_en,
            alert.title_kh,
            alert.message_en,
            alert.message_kh,
            alert.severity,
            String(alert.value),
            String(alert.threshold),
            alert.forecast_date,
            sentCount,
          ]
        );

        sendResults.push({ alertId: alert.id, sentCount, failedCount });
      }

      return sendResults;
    });

    const totalSent = results.reduce((sum, r) => sum + r.sentCount, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failedCount, 0);

    return NextResponse.json({
      success: true,
      alerts_processed: results.length,
      total_sent: totalSent,
      total_failed: totalFailed,
      results,
    });

  } catch (error) {
    console.error('Weather alerts POST error:', error);
    return NextResponse.json(
      { error: 'Failed to send weather alerts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Cron endpoint for automatic checks (can be called by external scheduler)
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const autoSend = searchParams.get('auto_send') === 'true';
    const targetUsers = searchParams.get('target') || 'all';

    // Fetch weather and air quality data
    const weatherUrl = process.env.WEATHER_API_BASE_URL || 'https://weather-scraper-8m4z.vercel.app/api/weather';
    const airQualityUrl = process.env.AIR_QUALITY_API_URL || 'https://weather-scraper-8m4z.vercel.app/api/windy/air-quality';

    const [weatherResponse, airQualityResponse] = await Promise.all([
      fetch(weatherUrl, { cache: 'no-store' }),
      fetch(airQualityUrl, { cache: 'no-store' }),
    ]);

    const weatherJson = await weatherResponse.json();
    const airQualityJson = await airQualityResponse.json();

    const weatherData = weatherJson.data || weatherJson;
    const airQualityData = airQualityJson.data || airQualityJson;

    // Check for alerts
    const weatherAlerts = checkWeatherAlerts(weatherData.hourly || []);
    const airQualityAlerts = checkAirQualityAlerts(Array.isArray(airQualityData) ? airQualityData : []);

    // Deduplicate alerts
    const uniqueAlerts = new Map<string, Alert>();
    [...weatherAlerts, ...airQualityAlerts].forEach(alert => {
      const key = `${alert.type}-${alert.area_id}-${alert.forecast_date}`;
      if (!uniqueAlerts.has(key)) {
        uniqueAlerts.set(key, alert);
      }
    });

    const allAlerts = Array.from(uniqueAlerts.values());

    if (allAlerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No alerts to send',
        alerts_found: 0,
        checked_at: new Date().toISOString(),
      });
    }

    // Check which alerts haven't been sent in the last 24 hours
    const newAlerts = await withPool(async (pool) => {
      // Create table if not exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS weather_alerts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          alert_type VARCHAR(50) NOT NULL,
          area_id INT NOT NULL,
          province_en VARCHAR(100),
          province_kh VARCHAR(100),
          title_en VARCHAR(255),
          title_kh VARCHAR(255),
          message_en TEXT,
          message_kh TEXT,
          severity VARCHAR(20),
          value VARCHAR(255),
          threshold VARCHAR(255),
          forecast_date DATE,
          users_notified INT DEFAULT 0,
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_alert_type (alert_type),
          INDEX idx_area_id (area_id),
          INDEX idx_sent_at (sent_at)
        )
      `);

      // Get alerts sent in last 24 hours
      const [recentAlerts] = await pool.query(`
        SELECT alert_type, area_id, forecast_date 
        FROM weather_alerts 
        WHERE sent_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `);

      const recentSet = new Set(
        (recentAlerts as any[]).map(a => `${a.alert_type}-${a.area_id}-${a.forecast_date}`)
      );

      // Filter out already sent alerts
      return allAlerts.filter(alert => {
        const key = `${alert.type}-${alert.area_id}-${alert.forecast_date}`;
        return !recentSet.has(key);
      });
    });

    if (newAlerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All alerts already sent in last 24 hours',
        alerts_found: allAlerts.length,
        new_alerts: 0,
        checked_at: new Date().toISOString(),
      });
    }

    if (!autoSend) {
      return NextResponse.json({
        success: true,
        message: 'Alerts found but auto_send is disabled',
        alerts_found: allAlerts.length,
        new_alerts: newAlerts.length,
        alerts: newAlerts,
        checked_at: new Date().toISOString(),
      });
    }

    // Auto-send alerts
    const postResponse = await fetch(request.url.replace('?auto_send=true', '').split('?')[0], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alerts: newAlerts,
        target_users: targetUsers,
      }),
    });

    const postResult = await postResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Automatic weather alerts processed',
      alerts_found: allAlerts.length,
      new_alerts_sent: newAlerts.length,
      send_results: postResult,
      checked_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Weather alerts cron error:', error);
    return NextResponse.json(
      { error: 'Failed to process automatic alerts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
