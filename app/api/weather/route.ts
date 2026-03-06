import { NextResponse } from 'next/server';

// Area ID to province name mapping for Cambodia
const areaMapping: { [key: number]: string } = {
  1: 'ភ្នំពេញ', // Phnom Penh
  2: 'កណ្ដាល', // Kandal
  3: 'ព្រៃវែង', // Prey Veng
  4: 'ស្វាយរៀង', // Svay Rieng
  5: 'កំពង់ចាម', // Kampong Cham
  6: 'ត្បូងឃ្មុំ', // Tbong Khmum
  7: 'កំពង់ឆ្នាំង', // Kampong Chhnang
  8: 'កំពង់ធំ', // Kampong Thom
  9: 'កំពង់ស្ពឺ', // Kampong Speu
  10: 'តាកែវ', // Takeo
  11: 'កំពត', // Kampot
  12: 'កែប', // Kep
  13: 'ព្រះសីហនុ', // Preah Sihanouk
  14: 'កោះកុង', // Koh Kong
  15: 'បាត់ដំបង', // Battambang
  16: 'បន្ទាយមានជ័យ', // Banteay Meanchey
  17: 'សៀមរាប', // Siem Reap
  18: 'ឧត្ដរមានជ័យ', // Oddar Meanchey
  19: 'ព្រះវិហារ', // Preah Vihear
  20: 'ស្ទឹងត្រែង', // Stung Treng
  21: 'រតនគិរី', // Ratanakiri
  22: 'មណ្ឌលគិរី', // Mondulkiri
  23: 'ក្រចេះ', // Kratie
  24: 'បុរីជុំ', // Pursat
  32: 'ប៉ៃលិន', // Pailin
};

// English names for provinces
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

// Period translations
const periodMapping: { [key: string]: string } = {
  'ព្រឹក': 'Morning',
  'ថ្ងៃ': 'Day',
  'យប់': 'Night',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'weather';

  try {
    if (action === 'weather') {
      // Fetch weather data
      const weatherUrl = process.env.WEATHER_API_BASE_URL || 'https://weather-scraper-8m4z.vercel.app/api/weather';
      const response = await fetch(weatherUrl, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 1800 } // Cache for 30 minutes
      });

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const responseData = await response.json();
      const data = responseData.data || responseData; // Handle nested data structure
      
      // Transform hourly data to include province names
      const transformedHourly = (data.hourly || []).map((item: {
        area_id: number;
        period: string;
        [key: string]: unknown;
      }) => ({
        ...item,
        province_kh: areaMapping[item.area_id] || `Area ${item.area_id}`,
        province_en: areaEnglishMapping[item.area_id] || `Area ${item.area_id}`,
        period_en: periodMapping[item.period] || item.period,
      }));

      // Transform daily data
      const transformedDaily = (data.daily || []).map((item: {
        area_id: number;
        [key: string]: unknown;
      }) => ({
        ...item,
        province_kh: areaMapping[item.area_id] || `Area ${item.area_id}`,
        province_en: areaEnglishMapping[item.area_id] || `Area ${item.area_id}`,
      }));

      return NextResponse.json({
        success: true,
        hourly: transformedHourly,
        daily: transformedDaily,
        areaMapping: areaEnglishMapping,
      });

    } else if (action === 'air-quality') {
      // Fetch air quality data
      const airQualityUrl = process.env.AIR_QUALITY_API_BASE_URL || 'https://weather-scraper-8m4z.vercel.app/api/windy/air-quality';
      const response = await fetch(airQualityUrl, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 1800 } // Cache for 30 minutes
      });

      if (!response.ok) {
        throw new Error(`Air Quality API error: ${response.status}`);
      }

      const responseData = await response.json();
      const data = responseData.data || responseData; // Handle nested data structure
      
      // Transform air quality data to include province names
      const transformedData = (Array.isArray(data) ? data : []).map((item: {
        area_id: number;
        [key: string]: unknown;
      }) => ({
        ...item,
        province_kh: areaMapping[item.area_id] || `Area ${item.area_id}`,
        province_en: areaEnglishMapping[item.area_id] || `Area ${item.area_id}`,
      }));

      return NextResponse.json({
        success: true,
        data: transformedData,
        areaMapping: areaEnglishMapping,
      });

    } else if (action === 'combined') {
      // Fetch both weather and air quality data
      const weatherUrl = process.env.WEATHER_API_BASE_URL || 'https://weather-scraper-8m4z.vercel.app/api/weather';
      const airQualityUrl = process.env.AIR_QUALITY_API_BASE_URL || 'https://weather-scraper-8m4z.vercel.app/api/windy/air-quality';

      const [weatherResponse, airQualityResponse] = await Promise.all([
        fetch(weatherUrl, { next: { revalidate: 1800 } }),
        fetch(airQualityUrl, { next: { revalidate: 1800 } }),
      ]);

      const weatherResponseData = await weatherResponse.json();
      const airQualityResponseData = await airQualityResponse.json();
      
      // Handle nested data structure
      const weatherData = weatherResponseData.data || weatherResponseData;
      const airQualityData = airQualityResponseData.data || airQualityResponseData;

      // Transform weather hourly data
      const transformedHourly = (weatherData.hourly || []).map((item: {
        area_id: number;
        period: string;
        [key: string]: unknown;
      }) => ({
        ...item,
        province_kh: areaMapping[item.area_id] || `Area ${item.area_id}`,
        province_en: areaEnglishMapping[item.area_id] || `Area ${item.area_id}`,
        period_en: periodMapping[item.period] || item.period,
      }));

      // Transform weather daily data
      const transformedDaily = (weatherData.daily || []).map((item: {
        area_id: number;
        [key: string]: unknown;
      }) => ({
        ...item,
        province_kh: areaMapping[item.area_id] || `Area ${item.area_id}`,
        province_en: areaEnglishMapping[item.area_id] || `Area ${item.area_id}`,
      }));

      // Transform air quality data
      const transformedAirQuality = (Array.isArray(airQualityData) ? airQualityData : []).map((item: {
        area_id: number;
        [key: string]: unknown;
      }) => ({
        ...item,
        province_kh: areaMapping[item.area_id] || `Area ${item.area_id}`,
        province_en: areaEnglishMapping[item.area_id] || `Area ${item.area_id}`,
      }));

      return NextResponse.json({
        success: true,
        weather: {
          hourly: transformedHourly,
          daily: transformedDaily,
        },
        airQuality: transformedAirQuality,
        areaMapping: areaEnglishMapping,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
