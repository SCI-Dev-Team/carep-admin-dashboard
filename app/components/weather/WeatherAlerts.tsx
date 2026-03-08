"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

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
  value?: string | number;
  threshold?: string | number;
  created_at: string;
}

interface AlertSummary {
  total: number;
  high_heat: number;
  heavy_rain: number;
  strong_wind: number;
  fungal_disease_risk: number;
  air_pollution: number;
}

interface AlertHistory {
  id: number;
  alert_type: string;
  area_id: number;
  province_en: string;
  province_kh: string;
  title_en: string;
  title_kh: string;
  severity: string;
  value: string;
  forecast_date: string;
  users_notified: number;
  sent_at: string;
}

interface WeatherAlertsProps {
  onClose?: () => void;
}

export default function WeatherAlerts({ onClose }: WeatherAlertsProps) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [checkedAt, setCheckedAt] = useState<string>('');
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [targetUsers, setTargetUsers] = useState<'all' | 'farmer_leads'>('all');
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');

  const todayStr = (() => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  })();

  const filteredAlerts = dateFilter === 'today' ? alerts.filter((a) => a.forecast_date === todayStr) : alerts;
  const filteredHistory = dateFilter === 'today' ? history.filter((h) => h.forecast_date === todayStr) : history;

  const summaryForDisplay =
    summary && dateFilter === 'today'
      ? {
          total: filteredAlerts.length,
          high_heat: filteredAlerts.filter((a) => a.type === 'high_heat').length,
          heavy_rain: filteredAlerts.filter((a) => a.type === 'heavy_rain').length,
          strong_wind: filteredAlerts.filter((a) => a.type === 'strong_wind').length,
          fungal_disease_risk: filteredAlerts.filter((a) => a.type === 'fungal_disease_risk').length,
          air_pollution: filteredAlerts.filter((a) => a.type === 'air_pollution').length,
        }
      : summary;
  const checkAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/weather/alerts?action=check');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to check alerts');
      }

      setAlerts(result.alerts || []);
      setSummary(result.summary || null);
      setCheckedAt(result.checked_at || new Date().toISOString());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to check alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/weather/alerts?action=history&limit=50');
      const result = await response.json();

      if (result.success) {
        setHistory(result.history || []);
        setHistoryTotal(result.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch alert history:', err);
    }
  }, []);

  useEffect(() => {
    checkAlerts();
    fetchHistory();
  }, [checkAlerts, fetchHistory]);

  const toggleAlertSelection = (alertId: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  const selectAll = () => {
    const filtered = dateFilter === 'today' ? alerts.filter((a) => a.forecast_date === todayStr) : alerts;
    if (selectedAlerts.size === filtered.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(filtered.map((a) => a.id)));
    }
  };

  const sendSelectedAlerts = async () => {
    if (selectedAlerts.size === 0) return;

    setSending(true);

    try {
      const list = dateFilter === 'today' ? alerts.filter((a) => a.forecast_date === todayStr) : alerts;
      const selectedAlertObjects = list.filter((a) => selectedAlerts.has(a.id));
      
      const response = await fetch('/api/weather/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alerts: selectedAlertObjects,
          target_users: targetUsers,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send alerts');
      }

      const sent = result.total_sent || 0;
      const failed = result.total_failed || 0;
      toast.success(`${sent} notification(s) sent${failed > 0 ? `, ${failed} failed` : ''}`);

      // Clear selection and refresh
      setSelectedAlerts(new Set());
      await fetchHistory();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send alerts');
    } finally {
      setSending(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'high_heat':
        return '🌡️';
      case 'heavy_rain':
        return '🌧️';
      case 'strong_wind':
        return '💨';
      case 'fungal_disease_risk':
        return '🍄';
      case 'air_pollution':
        return '😷';
      default:
        return '⚠️';
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAlertValue = (alert: Alert): string => {
    if (alert.value == null || alert.value === '') return '';
    const v = alert.value;
    switch (alert.type) {
      case 'high_heat':
        return `${v}°C (Celsius)`;
      case 'strong_wind':
        return `${v} km/h`;
      case 'heavy_rain':
        return typeof v === 'string' ? v : String(v);
      case 'fungal_disease_risk':
        return typeof v === 'string' ? v : String(v);
      case 'air_pollution':
        return typeof v === 'string' ? v : String(v);
      default:
        return String(v);
    }
  };

  const formatHistoryValue = (alertType: string, value: string): string => {
    if (!value) return '';
    switch (alertType) {
      case 'high_heat':
        return value.includes('°') ? value : `${value}°C (Celsius)`;
      case 'strong_wind':
        return value.includes('km/h') ? value : `${value} km/h`;
      default:
        return value;
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-slate-600">Checking weather conditions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🔔 Weather Alerts</h1>
          <p className="text-slate-500 mt-1">
            Automatic alerts for dangerous weather conditions
            {checkedAt && (
              <span className="text-xs ml-2 text-slate-400">
                Last checked: {formatDateTime(checkedAt)}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={checkAlerts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:bg-emerald-300"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Check Alerts
        </button>
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-slate-600">Show:</span>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setDateFilter('today')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              dateFilter === 'today' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-l border-slate-200 ${
              dateFilter === 'all' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            All
          </button>
        </div>
        {dateFilter === 'today' && (
          <span className="text-xs text-slate-500">({todayStr})</span>
        )}
      </div>

      {/* Summary Cards */}
      {summaryForDisplay && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-800">{summaryForDisplay.total}</div>
            <div className="text-sm text-slate-500">Total Alerts</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="text-2xl font-bold text-red-700">{summaryForDisplay.high_heat}</div>
            <div className="text-sm text-red-600">🌡️ High Heat</div>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="text-2xl font-bold text-blue-700">{summaryForDisplay.heavy_rain}</div>
            <div className="text-sm text-blue-600">🌧️ Heavy Rain</div>
          </div>
          <div className="bg-cyan-50 rounded-lg border border-cyan-200 p-4">
            <div className="text-2xl font-bold text-cyan-700">{summaryForDisplay.strong_wind}</div>
            <div className="text-sm text-cyan-600">💨 Strong Wind</div>
          </div>
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <div className="text-2xl font-bold text-amber-700">{summaryForDisplay.fungal_disease_risk}</div>
            <div className="text-sm text-amber-600">🍄 Fungal Risk</div>
          </div>
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
            <div className="text-2xl font-bold text-purple-700">{summaryForDisplay.air_pollution}</div>
            <div className="text-sm text-purple-600">😷 Air Pollution</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'current'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Current Alerts ({filteredAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Sent History ({dateFilter === 'today' ? filteredHistory.length : historyTotal})
        </button>
      </div>

      {activeTab === 'current' && (
        <>
          {/* Send Controls */}
          {filteredAlerts.length > 0 && (
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-6">
              <p className="text-sm text-slate-600 mb-3">
                Each alert is sent only to users whose <strong>location</strong> matches that alert&apos;s province (e.g. Stung Treng alert → only users in Stung Treng).
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={selectAll}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded text-sm font-medium transition-colors"
                >
                  {selectedAlerts.size === filteredAlerts.length ? 'Deselect All' : 'Select All'}
                </button>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Pool:</label>
                  <select
                    value={targetUsers}
                    onChange={(e) => setTargetUsers(e.target.value as 'all' | 'farmer_leads')}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm"
                  >
                    <option value="all">All users (then filter by province per alert)</option>
                    <option value="farmer_leads">Farmer leads only (then filter by province per alert)</option>
                  </select>
                </div>

                <button
                  onClick={sendSelectedAlerts}
                  disabled={selectedAlerts.size === 0 || sending}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send {selectedAlerts.size} Alert{selectedAlerts.size !== 1 ? 's' : ''}
                    </>
                  )}
                </button>

                <span className="text-sm text-slate-500">
                  {selectedAlerts.size} selected
                </span>
              </div>
            </div>
          )}

          {/* Alerts List */}
          {filteredAlerts.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-green-800">No Active Alerts</h3>
              <p className="text-green-600 mt-1">
                {dateFilter === 'today'
                  ? `No weather alerts for today (${todayStr}).`
                  : 'Weather conditions are normal across all provinces.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-4 cursor-pointer transition-all ${
                    selectedAlerts.has(alert.id)
                      ? 'ring-2 ring-emerald-500 ' + getSeverityColor(alert.severity)
                      : getSeverityColor(alert.severity)
                  }`}
                  onClick={() => toggleAlertSelection(alert.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.has(alert.id)}
                        onChange={() => toggleAlertSelection(alert.id)}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-3xl">{getAlertIcon(alert.type)}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <h3 className="font-bold">{alert.title_kh}</h3>
                      </div>
                      <p className="text-sm opacity-80">{alert.title_en}</p>
                      
                      <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          📍 {alert.province_kh} / {alert.province_en}
                        </span>
                        <span className="flex items-center gap-1">
                          📅 {alert.forecast_date}
                        </span>
                        {alert.value != null && alert.value !== '' && (
                          <span className="flex items-center gap-1 font-mono bg-black/10 px-2 rounded">
                            {formatAlertValue(alert)}
                          </span>
                        )}
                      </div>
                      
                      <p className="mt-2 text-sm">{alert.message_kh}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              {dateFilter === 'today' ? `No alerts sent today (${todayStr}).` : 'No alert history yet. Sent alerts will appear here.'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Province</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Users Notified</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{getAlertIcon(item.alert_type)}</span>
                        <span className="text-sm font-medium">{item.title_en || item.alert_type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.province_kh || item.province_en}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{formatHistoryValue(item.alert_type, item.value)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-sm">
                        {item.users_notified} users
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDateTime(item.sent_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Auto-Check Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">🤖 Automatic Alert System</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>To enable automatic notifications, set up a cron job to call:</p>
          <code className="block bg-blue-100 p-2 rounded mt-2 font-mono text-xs">
            PUT /api/weather/alerts?auto_send=true&target=all
          </code>
          <p className="mt-2">Thresholds:</p>
          <ul className="list-disc list-inside ml-2 text-xs space-y-0.5">
            <li>High Heat: Temperature ≥ 35°C</li>
            <li>Heavy Rain: Weather conditions indicate rain/storm</li>
            <li>Strong Wind: Wind speed ≥ 30 km/h</li>
            <li>Fungal Risk: Humidity ≥ 85% AND Temperature ≥ 30°C</li>
            <li>Air Pollution: CO ≥ 2000 OR SO2 ≥ 40</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
