"use client";

import React, { useState, useEffect, useCallback } from 'react';

// Types
interface HourlyWeather {
  id: string;
  area_id: number;
  province_kh: string;
  province_en: string;
  period: string;
  period_en: string;
  humidity: string;
  temperature: string;
  wind_speed: string;
  wind_direction_value: string;
  weather_value: string;
  weather_image: string;
  forecast_date: string;
}

interface DailyWeather {
  id: string;
  area_id: number;
  province_kh: string;
  province_en: string;
  max_humidity: string;
  max_temperature: string;
  min_humidity: string;
  min_temperature: string;
  forecast_date: string;
}

interface AirQualityData {
  id: string;
  area_id: number;
  province_kh: string;
  province_en: string;
  forecast_date: string;
  forecast_hour: number;
  forecast_timestamp: string;
  so2: number;
  dust: number;
  co: number;
}

interface WeatherDashboardProps {
  onClose: () => void;
}

export default function WeatherDashboard({ onClose }: WeatherDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyWeather[]>([]);
  const [dailyData, setDailyData] = useState<DailyWeather[]>([]);
  const [airQualityData, setAirQualityData] = useState<AirQualityData[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'hourly' | 'airquality'>('daily');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [provinces, setProvinces] = useState<{ id: number; name_en: string }[]>([]);

  const fetchWeatherData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/weather?action=combined');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch weather data');
      }

      setHourlyData(result.weather?.hourly || []);
      setDailyData(result.weather?.daily || []);
      setAirQualityData(result.airQuality || []);

      // Extract unique provinces
      const areaMapping = result.areaMapping || {};
      const uniqueProvinces = Object.entries(areaMapping).map(([id, name]) => ({
        id: parseInt(id),
        name_en: name as string,
      })).sort((a, b) => a.name_en.localeCompare(b.name_en));
      setProvinces(uniqueProvinces);

      // Set default date to the first available date
      if (result.weather?.daily?.length > 0) {
        const dates = [...new Set(result.weather.daily.map((d: DailyWeather) => d.forecast_date))];
        setSelectedDate(dates.sort()[0] as string);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  // Get unique dates from data
  const getUniqueDates = () => {
    const dates = new Set<string>();
    dailyData.forEach(d => dates.add(d.forecast_date));
    hourlyData.forEach(d => dates.add(d.forecast_date));
    return Array.from(dates).sort();
  };

  // Filter data based on selections
  const filteredDailyData = dailyData.filter(d => {
    const provinceMatch = selectedProvince === 'all' || d.area_id.toString() === selectedProvince;
    const dateMatch = !selectedDate || d.forecast_date === selectedDate;
    return provinceMatch && dateMatch;
  });

  const filteredHourlyData = hourlyData.filter(d => {
    const provinceMatch = selectedProvince === 'all' || d.area_id.toString() === selectedProvince;
    const dateMatch = !selectedDate || d.forecast_date === selectedDate;
    return provinceMatch && dateMatch;
  });

  const filteredAirQualityData = airQualityData.filter(d => {
    const provinceMatch = selectedProvince === 'all' || d.area_id.toString() === selectedProvince;
    const dateMatch = !selectedDate || d.forecast_date === selectedDate;
    return provinceMatch && dateMatch;
  });

  // Get AQI status based on values
  const getAQIStatus = (co: number, so2: number, dust: number) => {
    const avgPollution = (co / 1000 + so2 + dust) / 3;
    if (avgPollution < 1) return { status: 'Good', color: 'bg-green-500', textColor: 'text-green-700' };
    if (avgPollution < 3) return { status: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (avgPollution < 6) return { status: 'Unhealthy', color: 'bg-orange-500', textColor: 'text-orange-700' };
    return { status: 'Very Unhealthy', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Error loading weather data</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchWeatherData}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Weather Dashboard</h1>
          <p className="text-slate-500 mt-1">Weather forecasts and air quality data for Cambodia</p>
        </div>
        <button
          onClick={fetchWeatherData}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Province Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Province</label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Provinces</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {p.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {getUniqueDates().map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'daily' as const, label: 'Daily Forecast', count: filteredDailyData.length },
          { id: 'hourly' as const, label: 'Hourly Forecast', count: filteredHourlyData.length },
          { id: 'airquality' as const, label: 'Air Quality', count: filteredAirQualityData.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-emerald-400' : 'bg-slate-100'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'daily' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDailyData.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl p-8 text-center text-slate-500">
              No daily forecast data available for the selected filters.
            </div>
          ) : (
            filteredDailyData.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">{item.province_en}</h3>
                  <span className="text-xs text-slate-500">{formatDate(item.forecast_date)}</span>
                </div>
                <div className="text-sm text-slate-500 mb-3">{item.province_kh}</div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-xs text-orange-600 font-medium">High</div>
                    <div className="text-xl font-bold text-orange-700">{item.max_temperature}°C</div>
                    <div className="text-xs text-orange-500">{item.max_humidity}% humidity</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-blue-600 font-medium">Low</div>
                    <div className="text-xl font-bold text-blue-700">{item.min_temperature}°C</div>
                    <div className="text-xs text-blue-500">{item.min_humidity}% humidity</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'hourly' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Province</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Temp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Humidity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Wind</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Weather</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHourlyData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No hourly forecast data available for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredHourlyData.slice(0, 50).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{item.province_en}</div>
                        <div className="text-xs text-slate-500">{item.province_kh}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.period_en === 'Morning' ? 'bg-yellow-100 text-yellow-700' :
                          item.period_en === 'Day' ? 'bg-orange-100 text-orange-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {item.period_en}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{item.temperature}°C</td>
                      <td className="px-4 py-3 text-slate-600">{item.humidity}%</td>
                      <td className="px-4 py-3 text-slate-600">{item.wind_speed} km/h</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: item.weather_value.replace(/<br\s*\/?>/gi, ' ') }} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredHourlyData.length > 50 && (
            <div className="p-4 text-center text-sm text-slate-500 border-t border-slate-100">
              Showing 50 of {filteredHourlyData.length} records. Use filters to narrow results.
            </div>
          )}
        </div>
      )}

      {activeTab === 'airquality' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAirQualityData.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl p-8 text-center text-slate-500">
              No air quality data available for the selected filters.
            </div>
          ) : (
            // Group by province and show latest data
            Object.values(
              filteredAirQualityData.reduce((acc: { [key: number]: AirQualityData }, item) => {
                if (!acc[item.area_id] || new Date(item.forecast_timestamp) > new Date(acc[item.area_id].forecast_timestamp)) {
                  acc[item.area_id] = item;
                }
                return acc;
              }, {})
            ).map((item) => {
              const aqi = getAQIStatus(item.co, item.so2, item.dust);
              return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800">{item.province_en}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${aqi.color} text-white`}>
                      {aqi.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 mb-4">{item.province_kh}</div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">CO</span>
                      <span className="font-medium text-slate-800">{item.co.toFixed(2)} μg/m³</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">SO₂</span>
                      <span className="font-medium text-slate-800">{item.so2.toFixed(2)} μg/m³</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Dust</span>
                      <span className="font-medium text-slate-800">{item.dust.toFixed(2)} μg/m³</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    Updated: {new Date(item.forecast_timestamp).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
