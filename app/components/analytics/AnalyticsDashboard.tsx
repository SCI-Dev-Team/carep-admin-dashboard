"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useAuth } from "../layout/AuthContext";
import { brand } from "@/app/lib/brand";

export default function AnalyticsDashboard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedUser, setSelectedUser] = useState<number | string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const auth = useAuth();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selectedActionsList = Array.from(selectedActions);
    const selectedUsersList = Array.from(selectedUsers);
    return data.filter((r) => {
      if (selectedActionsList.length > 0 && !selectedActionsList.includes(String(r.event_type))) return false;
      if (selectedUsersList.length > 0 && !selectedUsersList.includes(String(r.user_id))) return false;
      if (!q) return true;
      return (
        String(r.id).includes(q) ||
        String(r.user_id).includes(q) ||
        String(r.event_type).toLowerCase().includes(q) ||
        String(r.event_data).toLowerCase().includes(q) ||
        String(r.timestamp).toLowerCase().includes(q)
      );
    });
  }, [query, data, selectedActions, selectedUsers]);

  function toggleAction(action: string) {
    setSelectedActions((prev) => {
      const next = new Set(prev);
      if (next.has(action)) next.delete(action);
      else next.add(action);
      return next;
    });
  }

  function toggleUser(userId: string) {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const json = await auth.login(username, password);
      setData(json);
      setPassword("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAnalytics() {
    if (!auth.basicAuth) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analytics", {
        headers: { Authorization: "Basic " + auth.basicAuth },
      });
      if (!res.ok) {
        throw new Error(await res.text().catch(() => "Failed to fetch"));
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("fetchAnalytics error", err);
      toast.error(err?.message ?? "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (auth.authed) {
      fetchAnalytics();
    } else {
      setData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.authed]);

  function getEventBadgeColor(eventType: string) {
    const colors: Record<string, string> = {
      "menu_action": "bg-slate-100 text-slate-700",
      "image_uploaded_and_processed": "bg-blue-100 text-blue-700",
      "prediction_success": "bg-emerald-100 text-emerald-700",
      "image_submitted": "bg-amber-100 text-amber-700",
      "app_opened": "bg-purple-100 text-purple-700",
    };
    return colors[eventType] || "bg-gray-100 text-gray-700";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Login Modal */}
      {!auth.authed ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden bg-white border border-slate-100">
                <Image src={brand.logo} alt={brand.projectName} width={64} height={64} className="object-contain" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{brand.projectName} Admin Dashboard</h2>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setUsername(""); setPassword(""); }}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : "Sign in"}
                </button>
              </div>
            </form>
            <p className="mt-6 text-xs text-center text-slate-500">Sign in with admin credentials to view dashboard.</p>
          </div>
        </div>
      ) : null}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-slate-100">
              <Image src={brand.logo} alt={brand.projectName} width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search events..."
                className="w-64 rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400"
              title="Export visible rows to CSV"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={fetchAnalytics}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => { auth.logout(); setUsername(""); setPassword(""); setData([]); }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Events</p>
                <p className="text-3xl font-bold text-slate-800">{data.length.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Unique Users</p>
                <p className="text-3xl font-bold text-emerald-600">{uniqueUsers(data)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Image Uploads</p>
                <p className="text-3xl font-bold text-purple-600">{countEventType(data, "image_uploaded_and_processed")}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Most Common</p>
                <p className="text-lg font-bold text-amber-600 truncate">{mostCommonAction(data).action || "—"}</p>
                <p className="text-xs text-slate-500">{mostCommonAction(data).count} occurrences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="w-72 shrink-0 space-y-4">
            {/* Actions Filter */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-700 text-sm">Filter by Action</h3>
              </div>
              <div className="p-3 max-h-64 overflow-y-auto space-y-1.5">
                {(function () {
                  const list = allActions(data);
                  if (!list.length) return <div className="text-sm text-slate-400 py-2 text-center">No actions</div>;
                  return list.map((a) => (
                    <label
                      key={a.action}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-all ${
                        selectedActions.has(a.action)
                          ? "bg-emerald-50 border border-emerald-200"
                          : "bg-slate-50 border border-transparent hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedActions.has(a.action)}
                          onChange={() => toggleAction(a.action)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700 truncate max-w-[140px]">{a.action}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full">{a.count}</span>
                    </label>
                  ));
                })()}
              </div>
              {selectedActions.size > 0 && (
                <div className="px-3 py-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedActions(new Set())}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Users Filter */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-700 text-sm">Filter by User</h3>
              </div>
              <div className="p-3 max-h-64 overflow-y-auto space-y-1.5">
                {(function () {
                  const userList = allUsers(data);
                  if (!userList.length) return <div className="text-sm text-slate-400 py-2 text-center">No users</div>;
                  return userList.map((u) => (
                    <label
                      key={String(u.user_id)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-all ${
                        selectedUsers.has(String(u.user_id))
                          ? "bg-emerald-50 border border-emerald-200"
                          : "bg-slate-50 border border-transparent hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(String(u.user_id))}
                          onChange={() => toggleUser(String(u.user_id))}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-mono text-slate-700">{u.user_id}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full">{u.count}</span>
                    </label>
                  ));
                })()}
              </div>
              {selectedUsers.size > 0 && (
                <div className="px-3 py-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedUsers(new Set())}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Events Table */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 340px)" }}>
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">ID</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">User ID</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Event Type</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Event Data</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-44">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm text-slate-500">Loading events...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-sm text-slate-500">No events found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageSlice(filtered, page, pageSize).map((row) => (
                      <tr 
                        key={row.id} 
                        className="hover:bg-emerald-50/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedUser(row.user_id)}
                      >
                        <td className="px-5 py-4 text-sm font-mono text-slate-500">{row.id}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-medium text-slate-700">
                            {row.user_id}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${getEventBadgeColor(row.event_type)}`}>
                            {row.event_type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600 max-w-xs truncate">{row.event_data}</td>
                        <td className="px-5 py-4 text-sm text-slate-500">{formatTimestamp(row.timestamp)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
              <p className="text-sm text-slate-600">
                Showing <span className="font-medium">{Math.min((page - 1) * pageSize + 1, filtered.length)}</span> to <span className="font-medium">{Math.min(page * pageSize, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> events
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg">
                  {page} / {Math.max(1, Math.ceil(filtered.length / pageSize))}
                </span>
                <button
                  disabled={page >= Math.ceil(filtered.length / pageSize)}
                  onClick={() => setPage((p) => Math.min(Math.ceil(filtered.length / pageSize), p + 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">User Activity</h3>
                <p className="text-sm text-slate-500">Actions for user <span className="font-mono font-medium">{selectedUser}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const rows = userActions(data, selectedUser);
                    const csv = ["id,user_id,event_type,event_data,timestamp"]
                      .concat(rows.map((r) => `${r.id},${r.user_id},"${String(r.event_type).replace(/"/g, '""')}","${String(r.event_data).replace(/"/g, '""')}",${JSON.stringify(r.timestamp)}`))
                      .join("\n");
                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `user-${selectedUser}-actions.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Event Type</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Event Data</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-44">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userActions(data, selectedUser).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-sm font-mono text-slate-500">{r.id}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${getEventBadgeColor(r.event_type)}`}>
                          {r.event_type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">{r.event_data}</td>
                      <td className="px-5 py-3 text-sm text-slate-500">{formatTimestamp(r.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function uniqueUsers(rows: any[]) {
  const s = new Set<number | string>();
  for (const r of rows) s.add(r.user_id ?? "");
  return s.size;
}

function countEventType(rows: any[], type: string) {
  return rows.reduce((n, r) => (r.event_type === type ? n + 1 : n), 0);
}

function pageSlice<T>(rows: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

function formatTimestamp(ts: string) {
  try {
    // handle MySQL datetime or ISO string
    const d = new Date(ts);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return ts;
  }
}

function exportCSV() {
  // export currently visible filtered rows in the UI by reading table rows
  // this helper will collect table data cells and generate CSV
  const rows: string[][] = [];
  const headers = ["id", "user_id", "event_type", "event_data", "timestamp"];
  rows.push(headers);
  // Read from DOM table rows to keep CSV matching current view (safer for large datasets)
  const tbody = document.querySelector("table tbody");
  if (!tbody) return;
  for (const tr of Array.from(tbody.querySelectorAll("tr"))) {
    const cells = Array.from(tr.querySelectorAll("td")).map((td) => td.textContent?.trim() ?? "");
    if (cells.length === headers.length) rows.push(cells);
  }
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "analytics.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function mostCommonAction(rows: any[]) {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const k = String(r.event_type ?? "unknown");
    counts[k] = (counts[k] || 0) + 1;
  }
  let best = "";
  let bestCount = 0;
  for (const k of Object.keys(counts)) {
    if (counts[k] > bestCount) {
      bestCount = counts[k];
      best = k;
    }
  }
  return { action: best, count: bestCount };
}

function topUsersForAction(rows: any[], action: string, limit = 10) {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    if (r.event_type !== action) continue;
    const uid = String(r.user_id ?? "");
    counts[uid] = (counts[uid] || 0) + 1;
  }
  const items = Object.keys(counts).map((k) => ({ user_id: k, count: counts[k] }));
  items.sort((a, b) => b.count - a.count || String(a.user_id).localeCompare(String(b.user_id)));
  return items.slice(0, limit);
}

function userActions(rows: any[], userId: string | number) {
  return rows.filter((r) => String(r.user_id) === String(userId)).sort((a, b) => (a.id < b.id ? 1 : -1));
}

function allActions(rows: any[]) {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const k = String(r.event_type ?? "unknown");
    counts[k] = (counts[k] || 0) + 1;
  }
  const items = Object.keys(counts).map((k) => ({ action: k, count: counts[k] }));
  items.sort((a, b) => b.count - a.count || a.action.localeCompare(b.action));
  return items;
}

function allUsers(rows: any[]) {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const k = String(r.user_id ?? "unknown");
    counts[k] = (counts[k] || 0) + 1;
  }
  const items = Object.keys(counts).map((k) => ({ user_id: k, count: counts[k] }));
  items.sort((a, b) => b.count - a.count || a.user_id.localeCompare(b.user_id));
  return items;
}


