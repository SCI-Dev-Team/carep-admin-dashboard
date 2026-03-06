"use client";

import React, { useEffect, useState } from "react";

type User = {
  user_id: number;
  gender?: string;
  age_range?: string;
  location?: string;
  created_at?: string;
  role: string;
  total_uploads?: number;
  best_streak?: number;
  telegram_name?: string;
};

type UserStats = {
  total: number;
  normal_users: number;
  farmer_leads: number;
};

type Activity = {
  id: number;
  user_id: number;
  event_type: string;
  event_data: string;
  timestamp: string;
};

export default function UserManagement({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Activity modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityPage, setActivityPage] = useState(0);
  const [activityLoading, setActivityLoading] = useState(false);
  const activityPageSize = 10;

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filterRole, page]);

  useEffect(() => {
    if (selectedUser) {
      fetchActivities(selectedUser.user_id);
    }
  }, [selectedUser, activityPage]);

  async function fetchActivities(userId: number) {
    setActivityLoading(true);
    try {
      const res = await fetch(
        `/api/users/activity?user_id=${userId}&limit=${activityPageSize}&offset=${activityPage * activityPageSize}`
      );
      const json = await res.json();
      setActivities(json.activities || []);
      setActivityTotal(json.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setActivityLoading(false);
    }
  }

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/users?limit=${pageSize}&offset=${page * pageSize}`;
      if (filterRole !== "all") {
        url += `&role=${filterRole}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      setUsers(json);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch("/api/users", { method: "POST" });
      const json = await res.json();
      setStats(json);
    } catch (err) {
      console.error(err);
    }
  }

  async function updateRole(userId: number, newRole: string) {
    setError(null);
    try {
      const res = await fetch(`/api/users?user_id=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        throw new Error("Failed to update role");
      }
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      console.error(err);
      setError("Failed to update role");
    }
  }

  function handleSearch() {
    setPage(0);
    fetchUsers();
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getEventBadge(eventType: string) {
    const colors: Record<string, string> = {
      "menu_action": "bg-slate-100 text-slate-700",
      "image_uploaded_and_processed": "bg-blue-100 text-blue-700",
      "prediction_success": "bg-emerald-100 text-emerald-700",
      "image_submitted": "bg-amber-100 text-amber-700",
    };
    return colors[eventType] || "bg-gray-100 text-gray-700";
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage user roles and view activity</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { fetchUsers(); fetchStats(); }} 
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button 
              onClick={onClose} 
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Users</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Normal Users</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.normal_users.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Farmer Leads</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.farmer_leads.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-600">Role:</label>
                <select
                  value={filterRole}
                  onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value="all">All Users</option>
                  <option value="normal_user">Normal Users</option>
                  <option value="farmer_lead">Farmer Leads</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by User ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-64 rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <button 
                onClick={handleSearch} 
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 420px)" }}>
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User ID</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Gender</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Age Range</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Uploads</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Streak</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Joined</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-slate-500">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm text-slate-500">No users found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr 
                      key={user.user_id} 
                      className="hover:bg-emerald-50/50 cursor-pointer transition-colors"
                      onClick={() => { setSelectedUser(user); setActivityPage(0); }}
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-medium text-slate-800">{user.user_id}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-800">{user.telegram_name || "-"}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{user.gender || "-"}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{user.age_range || "-"}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{user.location || "-"}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {user.total_uploads ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          {user.best_streak ?? 0} days
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">{formatDate(user.created_at)}</td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={user.role || "normal_user"}
                          onChange={(e) => updateRole(user.user_id, e.target.value)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm outline-none transition-all focus:ring-2 focus:ring-offset-1 ${
                            user.role === "farmer_lead" 
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700 focus:ring-emerald-500" 
                              : "border-slate-300 bg-white text-slate-700 focus:ring-slate-400"
                          }`}
                        >
                          <option value="normal_user">Normal User</option>
                          <option value="farmer_lead">Farmer Lead</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
            <p className="text-sm text-slate-600">
              Showing <span className="font-medium">{page * pageSize + 1}</span> to <span className="font-medium">{page * pageSize + users.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg">
                {page + 1}
              </span>
              <button
                disabled={users.length < pageSize}
                onClick={() => setPage((p) => p + 1)}
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

      {/* Activity Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">User Activity</h2>
                  <p className="text-sm text-slate-500">
                    User ID: <span className="font-mono font-medium text-slate-700">{selectedUser.user_id}</span>
                    {selectedUser.location && <span className="ml-2">• {selectedUser.location}</span>}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Event Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activityLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm text-slate-500">Loading activity...</span>
                        </div>
                      </td>
                    </tr>
                  ) : activities.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-sm text-slate-500">No activity recorded</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    activities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-sm text-slate-600">{activity.id}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getEventBadge(activity.event_type)}`}>
                            {activity.event_type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="text-sm text-slate-600 truncate" title={activity.event_data}>
                            {activity.event_data || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                          {formatDate(activity.timestamp)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 rounded-b-2xl">
              <p className="text-sm text-slate-600">
                Showing <span className="font-medium">{Math.min(activityPage * activityPageSize + 1, activityTotal)}</span> to{" "}
                <span className="font-medium">{Math.min((activityPage + 1) * activityPageSize, activityTotal)}</span> of{" "}
                <span className="font-medium">{activityTotal}</span> events
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={activityPage === 0}
                  onClick={() => setActivityPage((p) => p - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </button>
                <span className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg">
                  {activityPage + 1} / {Math.ceil(activityTotal / activityPageSize) || 1}
                </span>
                <button
                  disabled={activities.length < activityPageSize}
                  onClick={() => setActivityPage((p) => p + 1)}
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
      )}
    </div>
  );
}
