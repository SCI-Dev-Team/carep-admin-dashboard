"use client";

import React from "react";
import type { FarmerLead, User } from "./types";

type RecipientSelectorProps = {
  tab: "farmer_leads" | "all_users";
  onTabChange: (tab: "farmer_leads" | "all_users") => void;
  farmerLeads: FarmerLead[];
  allUsersList: User[];
  farmerLeadsLoading: boolean;
  allUsersListLoading: boolean;
  selectedUsers: Set<number>;
  selectAll: boolean;
  onSelectUser: (userId: number) => void;
  onSelectAll: () => void;
};

export default function RecipientSelector({
  tab,
  onTabChange,
  farmerLeads,
  allUsersList,
  farmerLeadsLoading,
  allUsersListLoading,
  selectedUsers,
  selectAll,
  onSelectUser,
  onSelectAll,
}: RecipientSelectorProps) {
  const list = tab === "farmer_leads" ? farmerLeads : allUsersList;
  const loading = tab === "farmer_leads" ? farmerLeadsLoading : allUsersListLoading;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Recipients</h2>
            <p className="text-sm text-slate-500">Select recipients for your notification</p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
            {list.length} total
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onTabChange("farmer_leads")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "farmer_leads" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Farmer Leads
          </button>
          <button
            onClick={() => onTabChange("all_users")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "all_users" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Users
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <input
            type="checkbox"
            id="selectAll"
            checked={selectAll}
            onChange={onSelectAll}
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="selectAll" className="text-sm font-medium text-slate-700">
            Select All ({selectedUsers.size} selected)
          </label>
        </div>
        <div className="max-h-80 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {tab === "farmer_leads" ? "No farmer leads found" : "No users found"}
            </div>
          ) : (
            list.map((user) => (
              <div
                key={user.user_id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedUsers.has(user.user_id)
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
                onClick={() => onSelectUser(user.user_id)}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.user_id)}
                  onChange={() => onSelectUser(user.user_id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className={`shrink-0 w-10 h-10 bg-gradient-to-br ${tab === "farmer_leads" ? "from-emerald-400 to-emerald-600" : "from-blue-400 to-blue-600"} rounded-full flex items-center justify-center text-white font-semibold`}>
                  {user.telegram_name ? user.telegram_name.slice(0, 2).toUpperCase() : user.user_id.toString().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">
                      {user.telegram_name || `User #${user.user_id}`}
                    </p>
                    {tab === "all_users" && (user as User).role && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${(user as User).role === "farmer_lead" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {(user as User).role === "farmer_lead" ? "Lead" : (user as User).role}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {user.location || "Unknown location"} | {user.gender || "N/A"} | {user.age_range || "N/A"}
                  </p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                  Telegram Ready
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
