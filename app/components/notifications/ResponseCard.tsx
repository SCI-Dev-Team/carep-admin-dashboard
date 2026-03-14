"use client";

import type { FarmerResponse } from "./types";
import { formatNotificationDate } from "./messageUtils";

type ResponseCardProps = {
  response: FarmerResponse;
  approving: number | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onEditApprove: (r: FarmerResponse) => void;
  onBroadcast: (r: FarmerResponse) => void;
};

export default function ResponseCard({
  response,
  approving,
  onApprove,
  onReject,
  onEditApprove,
  onBroadcast,
}: ResponseCardProps) {
  const isPending = response.approval_status === "pending" || !response.approval_status;

  return (
    <div
      className={`group relative bg-white border rounded-xl transition-all duration-200 hover:shadow-md ${
        !response.is_read
          ? "border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-200"
          : response.approval_status === "approved"
            ? "border-emerald-200"
            : response.approval_status === "rejected"
              ? "border-red-200"
              : "border-slate-200"
      }`}
    >
      {!response.is_read && (
        <div className="absolute -left-1 top-4 w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-300" />
      )}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center text-white">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                response.approval_status === "approved" ? "bg-emerald-500" : response.approval_status === "rejected" ? "bg-red-500" : "bg-amber-500"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-800">
                    {response.sender_name || `Farmer #${response.telegram_user_id}`}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${
                      response.approval_status === "approved"
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : response.approval_status === "rejected"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {response.approval_status === "approved" ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : response.approval_status === "rejected" ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    )}
                    {response.approval_status === "approved" ? "Approved" : response.approval_status === "rejected" ? "Rejected" : "Pending"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5" suppressHydrationWarning>
                  Telegram ID: {response.telegram_user_id} • {formatNotificationDate(response.received_at)}
                </p>
              </div>
            </div>
            <div
              className={`rounded-xl p-4 ${
                response.edited_message ? "bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-100" : "bg-slate-50 border border-slate-100"
              }`}
            >
              {response.has_image && (
                <div className="mb-3">
                  <a
                    href={`/api/notifications/webhook?action=response_image&id=${response.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-w-xs"
                  >
                    <img
                      src={`/api/notifications/webhook?action=response_image&id=${response.id}`}
                      alt="Price submission"
                      className="w-full h-auto max-h-48 object-contain"
                    />
                  </a>
                  <p className="text-xs text-slate-500 mt-1">📷 Sent as image</p>
                </div>
              )}
              {response.edited_message ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edited by Admin
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">{response.edited_message}</p>
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-400 mb-1">Original submission:</p>
                    <p className="text-xs text-slate-400 italic line-through">{response.message}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">{response.message}</p>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              {isPending ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onApprove(response.id)}
                    disabled={approving === response.id}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 shadow-sm shadow-emerald-200 transition-all active:scale-95"
                  >
                    {approving === response.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => onEditApprove(response)}
                    disabled={approving === response.id}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 border border-blue-200 transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit & Approve
                  </button>
                  <button
                    onClick={() => onReject(response.id)}
                    disabled={approving === response.id}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 border border-red-200 transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                      response.approval_status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {response.approval_status === "approved" ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="font-medium">{response.approval_status === "approved" ? "Approved" : "Rejected"}</span>
                    {response.approved_at && <span className="text-xs opacity-75" suppressHydrationWarning>• {formatNotificationDate(response.approved_at)}</span>}
                  </div>
                  {response.approval_status === "approved" && (
                    <button
                      onClick={() => onBroadcast(response)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-sm shadow-blue-200 transition-all active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                      Broadcast
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
