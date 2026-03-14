"use client";

import React from "react";
import type { NotificationHistory } from "./types";
import { formatNotificationDate } from "./messageUtils";

type NotificationHistoryTabProps = {
  history: NotificationHistory[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
};

export default function NotificationHistoryTab({
  history,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onRefresh,
}: NotificationHistoryTabProps) {
  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Notification History</h2>
            <p className="text-sm text-slate-500">
              Showing {history.length} of {total} notifications (Page {page} of {totalPages})
            </p>
          </div>
          <button
            onClick={() => onRefresh()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No notifications sent yet</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent At</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {history.map((notification) => (
                <tr key={notification.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm text-slate-800">#{notification.user_id}</td>
                  <td className="px-5 py-4 text-sm text-slate-600 max-w-md truncate">{notification.message}</td>
                  <td className="px-5 py-4 text-sm text-slate-500" suppressHydrationWarning>{formatNotificationDate(notification.sent_at)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        notification.status === "sent"
                          ? "bg-emerald-100 text-emerald-700"
                          : notification.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {notification.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {total > pageSize && (
        <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
