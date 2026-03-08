"use client";

import React from "react";
import type { FarmerResponse, PriceItem } from "./types";
import { structuredToMessage } from "./messageUtils";

type EditResponseModalProps = {
  open: boolean;
  response: FarmerResponse | null;
  editLocation: string;
  editPriceItems: PriceItem[];
  editNotes: string;
  approving: number | null;
  onClose: () => void;
  onLocationChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  updatePriceItem: (index: number, field: keyof PriceItem, value: string) => void;
  addPriceItem: () => void;
  removePriceItem: (index: number) => void;
  onSaveApprove: () => void;
};

export default function EditResponseModal({
  open,
  response,
  editLocation,
  editPriceItems,
  editNotes,
  approving,
  onClose,
  onLocationChange,
  onNotesChange,
  updatePriceItem,
  addPriceItem,
  removePriceItem,
  onSaveApprove,
}: EditResponseModalProps) {
  if (!open || !response) return null;

  const preview = structuredToMessage(editLocation, editPriceItems, editNotes);
  const canSave = !editPriceItems.every((i) => !i.vegetable || !i.price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Edit Price Report</h3>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                    {response.sender_name || `Farmer #${response.telegram_user_id}`}
                  </span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-lg">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <label className="text-sm font-semibold text-slate-700">Original Submission</label>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-fit">
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{response.message}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <label className="text-sm font-semibold text-slate-700">Edit Fields</label>
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Click to edit</span>
              </div>
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📍</span>
                    <label className="text-sm font-medium text-slate-700">Location</label>
                  </div>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => onLocationChange(e.target.value)}
                    placeholder="Enter location..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💰</span>
                      <label className="text-sm font-medium text-slate-700">Vegetable Prices</label>
                    </div>
                    <button type="button" onClick={addPriceItem} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editPriceItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg group/item">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={item.vegetable}
                            onChange={(e) => updatePriceItem(index, "vegetable", e.target.value)}
                            placeholder="Vegetable"
                            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                          />
                          <input
                            type="text"
                            value={item.price}
                            onChange={(e) => updatePriceItem(index, "price", e.target.value)}
                            placeholder="Price"
                            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => updatePriceItem(index, "unit", e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                          >
                            <option value="kg">KHR/kg</option>
                            <option value="g">KHR/g</option>
                            <option value="piece">KHR/piece</option>
                            <option value="bundle">KHR/bundle</option>
                          </select>
                        </div>
                        <button type="button" onClick={() => removePriceItem(index)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover/item:opacity-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {editPriceItems.length === 0 && (
                      <button type="button" onClick={addPriceItem} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-emerald-300 hover:text-emerald-600 text-sm">
                        + Add vegetable price
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📝</span>
                    <label className="text-sm font-medium text-slate-700">Notes</label>
                    <span className="text-xs text-slate-400">(optional)</span>
                  </div>
                  <textarea
                    value={editNotes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Additional notes..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <label className="text-sm font-semibold text-slate-700">Final Preview</label>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
                {preview || <span className="text-slate-400 italic">Fill in the fields above to generate the message</span>}
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">Changes will be saved and the response will be marked as approved</p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button
              onClick={onSaveApprove}
              disabled={approving === response.id || !canSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-200"
            >
              {approving === response.id ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Save & Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
