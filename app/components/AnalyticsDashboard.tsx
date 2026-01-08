 "use client";
 
import React, { useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

export default function AnalyticsDashboard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // auth state is provided by AuthContext
  const [query, setQuery] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      // Filter by selected actions
      if (selectedActionsList.length > 0 && !selectedActionsList.includes(String(r.event_type))) return false;
      // Filter by selected users
      if (selectedUsersList.length > 0 && !selectedUsersList.includes(String(r.user_id))) return false;
      // Filter by search query
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
    setError(null);
    setLoading(true);
    try {
      const json = await auth.login(username, password);
      setData(json);
      setPassword("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  }

  // fetch analytics when auth becomes available or on mount if already authed
  async function fetchAnalytics() {
    if (!auth.basicAuth) return;
    setLoading(true);
    setError(null);
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
      setError(err?.message ?? "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (auth.authed) {
      fetchAnalytics();
    } else {
      setData([]); // clear when logged out
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.authed]);

  // render dashboard UI but show a modal login overlay when not authenticated

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      {!auth.authed ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm p-6">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-green-800">CAREP Admin Dashboard</h2>
              <p className="text-sm text-green-600 mt-1">Save the Children Organization</p>
            </div>
            <h3 className="mb-4 text-xl font-medium text-green-700">Sign in</h3>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <label className="flex flex-col text-sm">
                <span className="mb-1 text-green-700">Username</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                  placeholder="admin"
                  autoComplete="username"
                />
              </label>
              <label className="flex flex-col text-sm">
                <span className="mb-1 text-green-700">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setUsername("");
                    setPassword("");
                  }}
                  className="rounded bg-blue-100 px-4 py-2 text-blue-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </div>
            </form>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            <p className="mt-4 text-xs text-green-600">Sign in with admin credentials to view dashboard.</p>
          </div>
        </div>
      ) : null}
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-green-800">Analytics Dashboard</h1>
            <p className="text-sm text-green-600 mt-1">CAREP Project - Save the Children</p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search id, user, type, data or timestamp"
              className="rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={exportCSV}
                className="rounded border border-green-600 bg-white px-3 py-2 text-green-700 hover:bg-green-50"
                title="Export visible rows to CSV"
              >
                Export CSV
              </button>
              <button
                onClick={() => {
                  auth.logout();
                  setUsername("");
                  setPassword("");
                  setData([]);
                }}
                className="rounded border border-green-600 bg-white px-3 py-2 text-green-700 hover:bg-green-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm font-medium text-green-600">Total events</div>
            <div className="mt-2 text-2xl font-semibold text-green-800">{data.length}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm font-medium text-green-600">Unique users</div>
            <div className="mt-2 text-2xl font-semibold text-green-800">{uniqueUsers(data)}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm font-medium text-green-600">Image uploads</div>
            <div className="mt-2 text-2xl font-semibold text-green-800">{countEventType(data, "image_uploaded_and_processed")}</div>
          </div>
          </div>

         <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-stretch">
          <aside className="md:w-1/4">
           <div className="rounded-lg bg-white p-4 shadow h-full flex flex-col">
            <div className="text-sm font-medium text-green-600">Actions</div>
            <div className="mt-2 text-lg font-semibold text-green-800">{mostCommonAction(data).action || "—"}</div>
            <div className="text-sm text-green-600">{mostCommonAction(data).count} occurrences</div>
              <div className="mt-3 flex flex-col gap-3 flex-1 overflow-auto">
               <div>
                 <div className="text-xs font-medium text-green-600">All actions</div>
                 <div className="mt-2 flex flex-col gap-1 max-h-64 overflow-y-auto">
                  {(function () {
                    const list = allActions(data);
                    if (!list.length) return <div className="text-sm text-green-500">—</div>;
                    return list.map((a) => (
                      <label
                        key={a.action}
                        className={
                          "flex items-center justify-between rounded border px-3 py-1 text-left text-sm " +
                          (selectedActions.has(a.action)
                            ? "bg-green-100 border-green-200 text-green-800"
                            : "bg-green-50 border-green-100 text-green-700 hover:bg-green-100")
                        }
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedActions.has(a.action)}
                            onChange={() => toggleAction(a.action)}
                            className="h-4 w-4"
                          />
                          <span className="truncate">{a.action}</span>
                        </div>
                        <span className="text-xs text-green-600 ml-3">{a.count}</span>
                      </label>
                    ));
                  })()}
                 </div>
               </div>

              <div className="mt-3">
                <div className="text-xs font-medium text-green-600">Users</div>
                <div className="mt-2 flex flex-col gap-1 max-h-64 overflow-y-auto">
                  {(function () {
                    const userList = allUsers(data);
                    if (!userList.length) return <div className="text-sm text-green-500">—</div>;
                    return userList.map((u) => (
                      <label
                        key={String(u.user_id)}
                        className={
                          "flex items-center justify-between rounded border px-3 py-1 text-left text-sm " +
                          (selectedUsers.has(String(u.user_id))
                            ? "bg-green-100 border-green-200 text-green-800"
                            : "bg-green-50 border-green-100 text-green-700 hover:bg-green-100")
                        }
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(String(u.user_id))}
                            onChange={() => toggleUser(String(u.user_id))}
                            className="h-4 w-4"
                          />
                          <span className="truncate">{u.user_id}</span>
                        </div>
                        <span className="text-xs text-green-600 ml-3">{u.count}</span>
                      </label>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
          </aside>

          <div className="flex-1">
            <div className="rounded-lg bg-white shadow h-full flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="w-full table-fixed border-collapse">
                  <thead className="sticky top-0 z-10 bg-green-100">
                    <tr>
                      <th className="w-16 px-4 py-3 text-left text-sm font-semibold text-green-800">ID</th>
                      <th className="w-36 px-4 py-3 text-left text-sm font-semibold text-green-800">User ID</th>
                      <th className="w-48 px-4 py-3 text-left text-sm font-semibold text-green-800">Event</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Data</th>
                      <th className="w-48 px-4 py-3 text-left text-sm font-semibold text-green-800">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-green-600">Loading…</td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-green-600">No records found</td>
                      </tr>
                    ) : (
                      pageSlice(filtered, page, pageSize).map((row) => (
                        <tr key={row.id} className="even:bg-white odd:bg-green-50">
                          <td className="px-4 py-4 text-sm text-green-700">{row.id}</td>
                          <td className="px-4 py-4 text-sm text-green-700">{row.user_id}</td>
                          <td className="px-4 py-4 text-sm text-green-700">{row.event_type}</td>
                          <td className="px-4 py-4 text-sm text-green-700">{row.event_data}</td>
                          <td className="px-4 py-4 text-sm text-green-700">{formatTimestamp(row.timestamp)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t px-4 py-3">
                <div className="text-sm text-green-600">
                  Showing {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded border border-green-300 px-3 py-1 text-sm text-green-700 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Prev
                  </button>
                  <div className="text-sm text-green-700">Page {page} / {Math.max(1, Math.ceil(filtered.length / pageSize))}</div>
                  <button
                    className="rounded border border-green-300 px-3 py-1 text-sm text-green-700 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.min(Math.ceil(filtered.length / pageSize), p + 1))}
                    disabled={page >= Math.ceil(filtered.length / pageSize)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {error ? <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      {selectedUser ? (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Actions for user {selectedUser}</h3>
                  <p className="text-sm text-green-600">Showing recent actions for this user</p>
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
                    className="rounded border border-green-600 bg-white px-3 py-1 text-sm text-green-700 hover:bg-green-50"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="rounded border border-red-300 bg-white px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[60vh]">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="w-20 px-3 py-2 text-left text-xs text-green-700">ID</th>
                      <th className="px-3 py-2 text-left text-xs text-green-700">Event</th>
                      <th className="px-3 py-2 text-left text-xs text-green-700">Data</th>
                      <th className="w-48 px-3 py-2 text-left text-xs text-green-700">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userActions(data, selectedUser).map((r) => (
                      <tr key={r.id} className="even:bg-white odd:bg-green-50">
                        <td className="px-3 py-3 text-sm text-green-700">{r.id}</td>
                        <td className="px-3 py-3 text-sm text-green-700">{r.event_type}</td>
                        <td className="px-3 py-3 text-sm text-green-700">{r.event_data}</td>
                        <td className="px-3 py-3 text-sm text-green-700">{formatTimestamp(r.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
      ) : null}
      </div>
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


