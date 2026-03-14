"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { formatDateTimeShortCambodia } from '@/app/lib/date-utils';

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

const SENT_KEYS_STORAGE_KEY = 'weatherAlertsSentKeys';

function loadSentKeysFromStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(SENT_KEYS_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveSentKeysToStorage(keys: Set<string>) {
  try {
    sessionStorage.setItem(SENT_KEYS_STORAGE_KEY, JSON.stringify([...keys]));
  } catch {
    // ignore
  }
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
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'both'>('today');
  // Keys of alerts already sent. Start empty so server/client match; load from sessionStorage after mount.
  const [sentThisSession, setSentThisSession] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    setSentThisSession(loadSentKeysFromStorage());
  }, []);

  const todayStr = (() => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  })();
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  })();

  // Normalize date to YYYY-MM-DD (API/DB may return ISO string or date-only)
  const toDateOnly = (d: string | undefined | null): string => {
    if (!d) return '';
    const s = typeof d === 'string' ? d : (d as unknown as Date).toISOString?.() ?? String(d);
    return s.slice(0, 10);
  };

  const isTodayOrTomorrow = (dateStr: string) => {
    const d = toDateOnly(dateStr);
    return d === todayStr || d === tomorrowStr;
  };

  // Single key format so history and current alerts always match (type + area_id + date)
  const sentKey = (type: string, areaId: number | string, forecastDate: string | undefined) =>
    `${String(type)}-${Number(areaId)}-${toDateOnly(forecastDate)}`;

  // Only show today and tomorrow; then filter by selected tab
  const alertsTodayTomorrow = useMemo(() => alerts.filter((a) => isTodayOrTomorrow(a.forecast_date)), [alerts, todayStr, tomorrowStr]);
  const historyTodayTomorrow = useMemo(() => history.filter((h) => isTodayOrTomorrow(h.forecast_date)), [history, todayStr, tomorrowStr]);

  const filteredAlerts =
    dateFilter === 'today'
      ? alertsTodayTomorrow.filter((a) => toDateOnly(a.forecast_date) === todayStr)
      : dateFilter === 'tomorrow'
        ? alertsTodayTomorrow.filter((a) => toDateOnly(a.forecast_date) === tomorrowStr)
        : alertsTodayTomorrow;
  const filteredHistory =
    dateFilter === 'today'
      ? historyTodayTomorrow.filter((h) => toDateOnly(h.forecast_date) === todayStr)
      : dateFilter === 'tomorrow'
        ? historyTodayTomorrow.filter((h) => toDateOnly(h.forecast_date) === tomorrowStr)
        : historyTodayTomorrow;

  // Keys of alerts already sent (from history) – show tick and prevent re-sending
  const sentAlertKeys = useMemo(() => {
    const set = new Set<string>();
    history.forEach((h) => set.add(sentKey(h.alert_type, h.area_id, h.forecast_date)));
    return set;
  }, [history]);

  const isAlertSent = (alert: Alert) => {
    const key = sentKey(alert.type, alert.area_id, alert.forecast_date);
    return sentAlertKeys.has(key) || sentThisSession.has(key);
  };

  const summaryForDisplay = summary
    ? {
        total: filteredAlerts.length,
        high_heat: filteredAlerts.filter((a) => a.type === 'high_heat').length,
        heavy_rain: filteredAlerts.filter((a) => a.type === 'heavy_rain').length,
        strong_wind: filteredAlerts.filter((a) => a.type === 'strong_wind').length,
        fungal_disease_risk: filteredAlerts.filter((a) => a.type === 'fungal_disease_risk').length,
        air_pollution: filteredAlerts.filter((a) => a.type === 'air_pollution').length,
      }
    : null;
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
        const list = result.history || [];
        setHistory(list);
        setHistoryTotal(result.total || 0);
        // Persist API history into sessionStorage so refresh still shows "sent" if API is slow or fails next time
        if (list.length > 0) {
          const stored = loadSentKeysFromStorage();
          list.forEach((h: AlertHistory) => stored.add(`${String(h.alert_type)}-${Number(h.area_id)}-${(h.forecast_date || '').slice(0, 10)}`));
          saveSentKeysToStorage(stored);
          setSentThisSession(stored);
        }
      }
    } catch (err) {
      console.error('Failed to fetch alert history:', err);
    }
  }, []);

  useEffect(() => {
    checkAlerts();
    fetchHistory();
  }, [checkAlerts, fetchHistory]);

  const toggleAlertSelection = (alert: Alert) => {
    if (isAlertSent(alert)) return; // already sent – cannot select
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alert.id)) {
      newSelected.delete(alert.id);
    } else {
      newSelected.add(alert.id);
    }
    setSelectedAlerts(newSelected);
  };

  const sendableAlerts = useMemo(() => {
    return filteredAlerts.filter((a) => !sentAlertKeys.has(sentKey(a.type, a.area_id, a.forecast_date)) && !sentThisSession.has(sentKey(a.type, a.area_id, a.forecast_date)));
  }, [filteredAlerts, sentAlertKeys, sentThisSession]);

  const selectAll = () => {
    if (selectedAlerts.size === sendableAlerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(sendableAlerts.map((a) => a.id)));
    }
  };

  const sendSelectedAlerts = async () => {
    if (selectedAlerts.size === 0) return;

    setSending(true);

    try {
      const list = dateFilter === 'today' ? alerts.filter((a) => toDateOnly(a.forecast_date) === todayStr) : alerts;
      const selectedAlertObjects = list.filter(
        (a) => selectedAlerts.has(a.id) && !isAlertSent(a)
      );
      if (selectedAlertObjects.length === 0) {
        setSelectedAlerts(new Set());
        return;
      }
      
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

      // Mark as sent in state and sessionStorage so tick + disabled survive refresh
      setSentThisSession((prev) => {
        const next = new Set(prev);
        selectedAlertObjects.forEach((a) => next.add(sentKey(a.type, a.area_id, a.forecast_date)));
        saveSentKeysToStorage(next);
        return next;
      });
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

  const formatDateTime = (dateStr: string) => formatDateTimeShortCambodia(dateStr);

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
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Weather Alerts</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {checkedAt ? (
              <>Last checked: <span className="text-slate-600 font-medium" suppressHydrationWarning>{formatDateTime(checkedAt)}</span></>
            ) : (
              'Check for dangerous weather conditions'
            )}
          </p>
        </div>
        <button
          onClick={checkAlerts}
          disabled={loading}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Check Alerts
        </button>
      </div>

      {/* Date filter — today and tomorrow only */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="inline-flex rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setDateFilter('today')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              dateFilter === 'today' ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('tomorrow')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-l border-slate-200 ${
              dateFilter === 'tomorrow' ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('both')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-l border-slate-200 ${
              dateFilter === 'both' ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Today & Tomorrow
          </button>
        </div>
        <span className="text-sm text-slate-500" suppressHydrationWarning>
          {dateFilter === 'today' && `(${todayStr})`}
          {dateFilter === 'tomorrow' && `(${tomorrowStr})`}
          {dateFilter === 'both' && `${todayStr} – ${tomorrowStr}`}
        </span>
      </div>

      {/* Summary Cards */}
      {summaryForDisplay && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="text-2xl font-bold text-slate-800">{summaryForDisplay.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-0.5">Total</div>
          </div>
          <div className="bg-red-50/80 rounded-xl border border-red-100 p-4 shadow-sm">
            <div className="text-xl font-bold text-red-700">{summaryForDisplay.high_heat}</div>
            <div className="text-xs font-medium text-red-600 mt-0.5">High heat</div>
          </div>
          <div className="bg-blue-50/80 rounded-xl border border-blue-100 p-4 shadow-sm">
            <div className="text-xl font-bold text-blue-700">{summaryForDisplay.heavy_rain}</div>
            <div className="text-xs font-medium text-blue-600 mt-0.5">Heavy rain</div>
          </div>
          <div className="bg-cyan-50/80 rounded-xl border border-cyan-100 p-4 shadow-sm">
            <div className="text-xl font-bold text-cyan-700">{summaryForDisplay.strong_wind}</div>
            <div className="text-xs font-medium text-cyan-600 mt-0.5">Strong wind</div>
          </div>
          <div className="bg-amber-50/80 rounded-xl border border-amber-100 p-4 shadow-sm">
            <div className="text-xl font-bold text-amber-700">{summaryForDisplay.fungal_disease_risk}</div>
            <div className="text-xs font-medium text-amber-600 mt-0.5">Fungal risk</div>
          </div>
          <div className="bg-purple-50/80 rounded-xl border border-purple-100 p-4 shadow-sm">
            <div className="text-xl font-bold text-purple-700">{summaryForDisplay.air_pollution}</div>
            <div className="text-xs font-medium text-purple-600 mt-0.5">Air pollution</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'current' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Current ({filteredAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          History ({dateFilter === 'today' ? filteredHistory.length : historyTotal})
        </button>
      </div>

      {activeTab === 'current' && (
        <>
          {/* Send Controls */}
          {filteredAlerts.length > 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6">
              <p className="text-sm text-slate-600 mb-4">
                Alerts are sent only to users whose <strong>location</strong> matches the alert province.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={selectAll}
                  className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700 transition-colors"
                >
                  {selectedAlerts.size === sendableAlerts.length && sendableAlerts.length > 0 ? 'Deselect all' : 'Select all'}
                </button>
                <select
                  value={targetUsers}
                  onChange={(e) => setTargetUsers(e.target.value as 'all' | 'farmer_leads')}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700"
                >
                  <option value="all">All users (by province)</option>
                  <option value="farmer_leads">Farmer leads only (by province)</option>
                </select>
                <button
                  onClick={sendSelectedAlerts}
                  disabled={selectedAlerts.size === 0 || sending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send {selectedAlerts.size} alert{selectedAlerts.size !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
                <span className="text-sm text-slate-500">{selectedAlerts.size} selected</span>
              </div>
            </div>
          )}

          {/* Current Alerts Table */}
          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-slate-800">No active alerts</h3>
              <p className="text-slate-500 mt-1 text-sm" suppressHydrationWarning>
                {dateFilter === 'today'
                  ? `No weather alerts for today (${todayStr}).`
                  : 'Weather conditions are normal across all provinces.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="w-12 px-4 py-3.5 text-left">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Province</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Value</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Message</th>
                      <th className="w-24 px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAlerts.map((alert) => {
                      const sent = isAlertSent(alert);
                      const selected = selectedAlerts.has(alert.id);
                      return (
                        <tr
                          key={alert.id}
                          onClick={() => !sent && toggleAlertSelection(alert)}
                          className={`transition-colors ${
                            sent
                              ? 'bg-slate-50/50 ' + getSeverityColor(alert.severity)
                              : selected
                                ? 'bg-emerald-50/70 ring-inset ' + getSeverityColor(alert.severity)
                                : 'hover:bg-slate-50/80 ' + getSeverityColor(alert.severity)
                          } ${!sent ? 'cursor-pointer' : ''}`}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={!sent && selected}
                              disabled={sent}
                              readOnly={sent}
                              onChange={() => !sent && toggleAlertSelection(alert)}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{getAlertIcon(alert.type)}</span>
                              <div>
                                <div className="font-medium text-slate-800">{alert.title_kh}</div>
                                <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${getSeverityBadge(alert.severity)}`}>
                                  {alert.severity}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">{alert.province_kh}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{alert.forecast_date}</td>
                          <td className="px-4 py-3">
                            {alert.value != null && alert.value !== '' ? (
                              <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">{formatAlertValue(alert)}</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate" title={alert.message_kh}>
                            {alert.message_kh}
                          </td>
                          <td className="px-4 py-3">
                            {sent ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Sent
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm" suppressHydrationWarning>
              {dateFilter === 'today' ? `No alerts sent today (${todayStr}).` : 'No alert history yet. Sent alerts will appear here.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Province</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Value</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Users notified</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Sent at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getAlertIcon(item.alert_type)}</span>
                          <span className="text-sm font-medium text-slate-800">{item.title_kh || item.title_en || item.alert_type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{item.province_kh || item.province_en}</td>
                      <td className="px-4 py-3.5 text-sm font-mono text-slate-600">{formatHistoryValue(item.alert_type, item.value) || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100">
                          {item.users_notified}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">{formatDateTime(item.sent_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}    
    </div>
  );
}
