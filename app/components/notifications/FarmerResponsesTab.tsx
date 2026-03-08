"use client";

import React from "react";
import type { FarmerResponse } from "./types";
import ResponseCard from "./ResponseCard";

type FarmerResponsesTabProps = {
  responses: FarmerResponse[];
  loading: boolean;
  unreadCount: number;
  approving: number | null;
  onMarkAllRead: () => void;
  onRefresh: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onEditApprove: (r: FarmerResponse) => void;
  onBroadcast: (r: FarmerResponse) => void;
};

export default function FarmerResponsesTab({
  responses,
  loading,
  unreadCount,
  approving,
  onMarkAllRead,
  onRefresh,
  onApprove,
  onReject,
  onEditApprove,
  onBroadcast,
}: FarmerResponsesTabProps) {
  const pendingCount = responses.filter((r) => !r.approval_status || r.approval_status === "pending").length;
  const approvedCount = responses.filter((r) => r.approval_status === "approved").length;
  const rejectedCount = responses.filter((r) => r.approval_status === "rejected").length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{responses.length}</p>
              <p className="text-xs text-slate-500">Total Responses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-xs text-slate-500">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
              <p className="text-xs text-slate-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              <p className="text-xs text-slate-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Farmer Responses</h2>
                <p className="text-sm text-slate-500">Review and approve price submissions from farmers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-red-200 animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full" />
                  {unreadCount} New
                </span>
              )}
              {unreadCount > 0 && (
                <button onClick={onMarkAllRead} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                  Mark all read
                </button>
              )}
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
        <div className="max-h-[calc(100vh-400px)] min-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-emerald-200 rounded-full" />
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-sm text-slate-500">Loading responses...</p>
            </div>
          ) : responses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-slate-100 rounded-full mb-4">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No responses yet</h3>
              <p className="text-sm text-slate-500 mt-1 text-center max-w-sm">
                Farmer responses will appear here when they submit price information via Telegram
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {responses.map((response) => (
                <ResponseCard
                  key={response.id}
                  response={response}
                  approving={approving}
                  onApprove={onApprove}
                  onReject={onReject}
                  onEditApprove={onEditApprove}
                  onBroadcast={onBroadcast}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
