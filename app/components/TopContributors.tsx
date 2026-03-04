"use client";

import React, { useEffect, useState } from "react";

type TopUser = {
  user_id: string;
  total_uploads: number;
  best_streak: number;
  gender?: string;
  location?: string;
};

type PriceContributor = {
  user_id: string;
  sender_name?: string;
  gender?: string;
  location?: string;
  total_submissions: number;
  approved_submissions: number;
};

export default function TopContributors({ onClose }: { onClose: () => void }) {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [priceContributors, setPriceContributors] = useState<PriceContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"uploads" | "prices">("uploads");

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    setLoading(true);
    await Promise.all([fetchTopUsers(), fetchPriceContributors()]);
    setLoading(false);
  }

  async function fetchTopUsers() {
    try {
      const res = await fetch("/api/users?limit=100");
      const json = await res.json();
      const users = Array.isArray(json) ? json : (json.users || []);
      const sorted = users
        .filter((u: TopUser) => (u.total_uploads || 0) > 0)
        .sort((a: TopUser, b: TopUser) => (b.total_uploads || 0) - (a.total_uploads || 0))
        .slice(0, 10);
      setTopUsers(sorted);
    } catch (err) {
      console.error("Failed to fetch top users:", err);
    }
  }

  async function fetchPriceContributors() {
    try {
      const res = await fetch("/api/users?action=top_price_contributors");
      const json = await res.json();
      setPriceContributors(json.contributors || []);
    } catch (err) {
      console.error("Failed to fetch price contributors:", err);
    }
  }

  const top3 = topUsers.slice(0, 3);
  const rest = topUsers.slice(3);
  
  const top3Price = priceContributors.slice(0, 3);
  const restPrice = priceContributors.slice(3);

  return (
    <div className="h-full w-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Top Contributors</h1>
              <p className="text-sm text-slate-500 mt-0.5">Leaderboard for uploads and price submissions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAllData}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
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

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          <button
            onClick={() => setActiveTab("uploads")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "uploads"
                ? "bg-amber-50 text-amber-700 border-t border-l border-r border-amber-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              📸 Image Uploads
            </span>
          </button>
          <button
            onClick={() => setActiveTab("prices")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "prices"
                ? "bg-emerald-50 text-emerald-700 border-t border-l border-r border-emerald-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              💰 Price Submissions
              {priceContributors.length > 0 && (
                <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                  {priceContributors.length}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <svg className="animate-spin h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-slate-500">Loading leaderboard...</span>
          </div>
        ) : activeTab === "uploads" && topUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-slate-600">No contributors yet</p>
              <p className="text-sm text-slate-400 mt-1">Users who upload images will appear here</p>
            </div>
          </div>
        ) : activeTab === "uploads" ? (
          <div className="space-y-6">
            {/* Podium Section - Top 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-700">🏆 Hall of Fame</h2>
              </div>
              <div className="p-8">
                <div className="flex items-end justify-center gap-4 md:gap-8">
                  {/* 2nd Place */}
                  {top3[1] && (
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-3xl shadow-lg border-4 border-white">
                          {top3[1].gender === "male" ? "👨" : top3[1].gender === "female" ? "👩" : "🧑"}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
                          2
                        </div>
                      </div>
                      <div className="mt-4 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-lg px-6 py-4 text-center min-w-[120px]" style={{ height: "100px" }}>
                        <p className="font-semibold text-slate-700 text-sm truncate max-w-[100px]">
                          {String(top3[1].user_id).slice(0, 10)}...
                        </p>
                        <p className="text-2xl font-bold text-slate-600 mt-1">{top3[1].total_uploads}</p>
                        <p className="text-xs text-slate-400">uploads</p>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {top3[0] && (
                    <div className="flex flex-col items-center -mt-6">
                      <div className="relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl">👑</div>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center text-4xl shadow-xl border-4 border-white">
                          {top3[0].gender === "male" ? "👨" : top3[0].gender === "female" ? "👩" : "🧑"}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
                          1
                        </div>
                      </div>
                      <div className="mt-4 bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-lg px-8 py-4 text-center min-w-[140px]" style={{ height: "140px" }}>
                        <p className="font-bold text-amber-800 truncate max-w-[120px]">
                          {String(top3[0].user_id).slice(0, 10)}...
                        </p>
                        <p className="text-3xl font-bold text-amber-600 mt-2">{top3[0].total_uploads}</p>
                        <p className="text-xs text-amber-500">uploads</p>
                        {top3[0].best_streak > 0 && (
                          <p className="text-xs text-amber-600 mt-1">🔥 {top3[0].best_streak} day streak</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {top3[2] && (
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-3xl shadow-lg border-4 border-white">
                          {top3[2].gender === "male" ? "👨" : top3[2].gender === "female" ? "👩" : "🧑"}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
                          3
                        </div>
                      </div>
                      <div className="mt-4 bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-lg px-6 py-4 text-center min-w-[120px]" style={{ height: "80px" }}>
                        <p className="font-semibold text-orange-700 text-sm truncate max-w-[100px]">
                          {String(top3[2].user_id).slice(0, 10)}...
                        </p>
                        <p className="text-2xl font-bold text-orange-600 mt-1">{top3[2].total_uploads}</p>
                        <p className="text-xs text-orange-400">uploads</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rest of leaderboard */}
            {rest.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-700">📊 Leaderboard</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {rest.map((user, index) => (
                    <div 
                      key={user.user_id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="shrink-0 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                        {index + 4}
                      </div>
                      <div className="shrink-0 w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-xl">
                        {user.gender === "male" ? "👨" : user.gender === "female" ? "👩" : "🧑"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-700 truncate">{user.user_id}</p>
                        {user.location && (
                          <p className="text-sm text-slate-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {user.location}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-bold text-slate-700">{user.total_uploads}</p>
                        <p className="text-xs text-slate-400">uploads</p>
                      </div>
                      {user.best_streak > 0 && (
                        <div className="shrink-0 text-right">
                          <p className="text-lg font-bold text-orange-500">{user.best_streak}</p>
                          <p className="text-xs text-slate-400">🔥 streak</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm">
                <p className="text-3xl font-bold text-amber-500">{topUsers.reduce((sum, u) => sum + (u.total_uploads || 0), 0)}</p>
                <p className="text-sm text-slate-500 mt-1">Total Uploads</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm">
                <p className="text-3xl font-bold text-emerald-500">{topUsers.length}</p>
                <p className="text-sm text-slate-500 mt-1">Active Contributors</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm">
                <p className="text-3xl font-bold text-orange-500">{Math.max(...topUsers.map(u => u.best_streak || 0), 0)}</p>
                <p className="text-sm text-slate-500 mt-1">Best Streak</p>
              </div>
            </div>
          </div>
        ) : activeTab === "prices" && priceContributors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">💰</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-slate-600">No price submissions yet</p>
              <p className="text-sm text-slate-400 mt-1">Farmer leads who submit prices will appear here</p>
            </div>
          </div>
        ) : activeTab === "prices" ? (
          <div className="space-y-6">
            {/* Podium Section - Top 3 Price Contributors */}
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50">
                <h2 className="font-semibold text-emerald-700">💰 Top Price Contributors</h2>
              </div>
              <div className="p-8">
                <div className="flex items-end justify-center gap-4 md:gap-8">
                  {/* 2nd Place */}
                  {top3Price[1] && (
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-3xl shadow-lg border-4 border-white">
                          {top3Price[1].gender === "ប្រុស" ? "👨‍🌾" : top3Price[1].gender === "ស្រី" ? "👩‍🌾" : "🧑‍🌾"}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
                          2
                        </div>
                      </div>
                      <div className="mt-4 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-lg px-6 py-4 text-center min-w-[120px]" style={{ height: "100px" }}>
                        <p className="font-semibold text-slate-700 text-sm truncate max-w-[100px]">
                          {top3Price[1].sender_name || `User ${String(top3Price[1].user_id).slice(0, 8)}...`}
                        </p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{top3Price[1].approved_submissions}</p>
                        <p className="text-xs text-slate-400">approved</p>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {top3Price[0] && (
                    <div className="flex flex-col items-center -mt-6">
                      <div className="relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl">👑</div>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 flex items-center justify-center text-4xl shadow-xl border-4 border-white">
                          {top3Price[0].gender === "ប្រុស" ? "👨‍🌾" : top3Price[0].gender === "ស្រី" ? "👩‍🌾" : "🧑‍🌾"}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
                          1
                        </div>
                      </div>
                      <div className="mt-4 bg-gradient-to-t from-emerald-200 to-emerald-100 rounded-t-lg px-8 py-4 text-center min-w-[140px]" style={{ height: "140px" }}>
                        <p className="font-bold text-emerald-800 truncate max-w-[120px]">
                          {top3Price[0].sender_name || `User ${String(top3Price[0].user_id).slice(0, 8)}...`}
                        </p>
                        <p className="text-3xl font-bold text-emerald-600 mt-2">{top3Price[0].approved_submissions}</p>
                        <p className="text-xs text-emerald-500">approved prices</p>
                        <p className="text-xs text-emerald-600 mt-1">📊 {top3Price[0].total_submissions} total</p>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {top3Price[2] && (
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg border-4 border-white">
                          {top3Price[2].gender === "ប្រុស" ? "👨‍🌾" : top3Price[2].gender === "ស្រី" ? "👩‍🌾" : "🧑‍🌾"}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
                          3
                        </div>
                      </div>
                      <div className="mt-4 bg-gradient-to-t from-teal-200 to-teal-100 rounded-t-lg px-6 py-4 text-center min-w-[120px]" style={{ height: "80px" }}>
                        <p className="font-semibold text-teal-700 text-sm truncate max-w-[100px]">
                          {top3Price[2].sender_name || `User ${String(top3Price[2].user_id).slice(0, 8)}...`}
                        </p>
                        <p className="text-2xl font-bold text-teal-600 mt-1">{top3Price[2].approved_submissions}</p>
                        <p className="text-xs text-teal-400">approved</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rest of price leaderboard */}
            {restPrice.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-700">📊 Price Submission Leaderboard</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {restPrice.map((user, index) => (
                    <div 
                      key={user.user_id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-600">
                        {index + 4}
                      </div>
                      <div className="shrink-0 w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center text-xl">
                        {user.gender === "ប្រុស" ? "👨‍🌾" : user.gender === "ស្រី" ? "👩‍🌾" : "🧑‍🌾"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-700 truncate">{user.sender_name || `User ${user.user_id}`}</p>
                        {user.location && (
                          <p className="text-sm text-slate-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {user.location}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-bold text-emerald-600">{user.approved_submissions}</p>
                        <p className="text-xs text-slate-400">approved</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-bold text-slate-500">{user.total_submissions}</p>
                        <p className="text-xs text-slate-400">total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-emerald-200 p-5 text-center shadow-sm">
                <p className="text-3xl font-bold text-emerald-500">{priceContributors.reduce((sum, u) => sum + (u.approved_submissions || 0), 0)}</p>
                <p className="text-sm text-slate-500 mt-1">Total Approved</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm">
                <p className="text-3xl font-bold text-teal-500">{priceContributors.length}</p>
                <p className="text-sm text-slate-500 mt-1">Active Leads</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm">
                <p className="text-3xl font-bold text-blue-500">{priceContributors.reduce((sum, u) => sum + (u.total_submissions || 0), 0)}</p>
                <p className="text-sm text-slate-500 mt-1">Total Submissions</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
