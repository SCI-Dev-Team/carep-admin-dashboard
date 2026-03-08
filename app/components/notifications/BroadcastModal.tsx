"use client";

import React from "react";
import type { FarmerResponse, User } from "./types";

type BroadcastModalProps = {
  open: boolean;
  response: FarmerResponse | null;
  users: User[];
  usersLoading: boolean;
  selectedUserIds: Set<number>;
  selectAll: boolean;
  broadcasting: boolean;
  onClose: () => void;
  onSelectUser: (userId: number) => void;
  onSelectAll: () => void;
  onSend: () => void;
};

export default function BroadcastModal({
  open,
  response,
  users,
  usersLoading,
  selectedUserIds,
  selectAll,
  broadcasting,
  onClose,
  onSelectUser,
  onSelectAll,
  onSend,
}: BroadcastModalProps) {
  if (!open || !response) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Broadcast Price Update</h2>
                <p className="text-sm text-slate-500">Send approved prices to all users</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Price to Broadcast</label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{response.edited_message || response.message}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Recipients ({selectedUserIds.size} selected)</label>
            <div className="mb-3 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="checkbox"
                id="broadcastSelectAll"
                checked={selectAll}
                onChange={onSelectAll}
                disabled={users.length === 0}
                className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <label htmlFor="broadcastSelectAll" className="text-sm font-medium text-blue-700 cursor-pointer">
                Select All Users ({users.length})
              </label>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3">
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">No users found</div>
              ) : (
                users.map((user) => (
                  <label
                    key={user.user_id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedUserIds.has(user.user_id) ? "bg-blue-50 border border-blue-200" : "bg-white border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.has(user.user_id)}
                      onChange={() => onSelectUser(user.user_id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-700">{user.telegram_name || `User #${user.user_id}`}</span>
                        {user.role && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${user.role === "farmer_lead" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                            {user.role === "farmer_lead" ? "Lead" : user.role}
                          </span>
                        )}
                        {user.gender && <span className="text-xs text-slate-400">• {user.gender}</span>}
                      </div>
                      {user.location && <p className="text-xs text-slate-500 truncate">{user.location}</p>}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">Price update will be sent to {selectedUserIds.size} user(s)</p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button
              onClick={onSend}
              disabled={broadcasting || selectedUserIds.size === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200"
            >
              {broadcasting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              Send Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
