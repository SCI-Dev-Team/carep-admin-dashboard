"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

type ImageUpload = {
  id: number;
  user_id?: number;
  username?: string;
  image_file: string;
  image_id?: string;
  created_at?: string;
  processed?: number;
  error_message?: string;
  disease_code?: string;
  disease_name?: string;
  disease_name_km?: string;
  confidence?: number;
  label: number;
  image_exists: boolean;
};

export default function ImageManagement({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<ImageUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterLabel, setFilterLabel] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const pageSize = 20;

  useEffect(() => {
    fetchList();
  }, [filterLabel, page]);

  async function fetchList() {
    setLoading(true);
    try {
      let url = `/api/images?limit=${pageSize}&offset=${page * pageSize}`;
      if (filterLabel !== "all") {
        url += `&label=${filterLabel}`;
      }
      
      const res = await fetch(url);
      const json = await res.json();
      setItems(json);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllOnPage() {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }

  async function submitLabel(labeled: 0 | 1) {
    if (selectedIds.size === 0) return;
    setSubmitting(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/images?id=${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label: labeled }),
          })
        )
      );
      toast.success(`${ids.length} image(s) ${labeled ? "marked as labeled" : "marked as unlabeled"}`);
      setSelectedIds(new Set());
      await fetchList();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update labels");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected image(s)? This will also delete the image files.`)) return;
    setSubmitting(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => fetch(`/api/images?id=${id}`, { method: "DELETE" })));
      toast.success(`${ids.length} image(s) deleted`);
      setSelectedIds(new Set());
      await fetchList();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    } finally {
      setSubmitting(false);
    }
  }

  function getImageUrl(imageFile: string): string {
    return `/api/images/serve?path=${encodeURIComponent(imageFile)}`;
  }

  const labeledCount = items.filter((i) => i.label === 1).length;
  const unlabeledCount = items.filter((i) => i.label === 0).length;
  const missingCount = items.filter((i) => !i.image_exists).length;

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Image Management</h1>
              <p className="text-sm text-slate-500 mt-0.5">Review and label uploaded images</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchList()} 
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
        <div className="grid grid-cols-4 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">This Page</p>
                <p className="text-3xl font-bold text-slate-800">{items.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Labeled</p>
                <p className="text-3xl font-bold text-emerald-600">{labeledCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Unlabeled</p>
                <p className="text-3xl font-bold text-amber-600">{unlabeledCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Missing</p>
                <p className="text-3xl font-bold text-red-600">{missingCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-600">Filter:</label>
                <select
                  value={filterLabel}
                  onChange={(e) => { setFilterLabel(e.target.value); setPage(0); }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value="all">All Images</option>
                  <option value="0">Unlabeled Only</option>
                  <option value="1">Labeled/Correct</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg">
                Page {page + 1}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={items.length < pageSize}
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

        {/* Batch actions bar */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center gap-4">
              <span className="font-medium text-slate-700">Select images, then apply an action:</span>
              <button
                type="button"
                onClick={selectAllOnPage}
                className="text-sm font-medium text-slate-600 hover:text-slate-800 underline"
              >
                {selectedIds.size === items.length ? "Deselect all" : "Select all on page"}
              </button>
              {selectedIds.size > 0 && (
                <span className="text-sm text-slate-500">
                  {selectedIds.size} selected
                </span>
              )}
            </div>
            {selectedIds.size > 0 && (
              <div className="px-5 py-3 flex flex-wrap items-center gap-3 border-b border-slate-100 bg-white">
                <button
                  type="button"
                  onClick={() => submitLabel(1)}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <span>✓</span>
                  )}
                  Submit
                </button>
                <button
                  type="button"
                  onClick={submitDelete}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        {/* Image Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-700">Uploaded Images</h3>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-slate-500">Loading images...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-slate-500">No images found</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`group relative bg-gradient-to-br from-slate-50 to-white rounded-xl border overflow-hidden hover:shadow-lg transition-all ${
                      selectedIds.has(item.id) ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Select checkbox */}
                    <div className="absolute top-2 right-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer bg-white/90 shadow"
                      />
                    </div>
                    {/* Image Preview */}
                    <div 
                      className="aspect-square bg-slate-100 cursor-pointer relative overflow-hidden"
                      onClick={() => item.image_exists && setSelectedImage(item.image_file)}
                    >
                      {item.image_exists ? (
                        <img
                          src={getImageUrl(item.image_file)}
                          alt={`Upload ${item.id}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f1f5f9" width="100" height="100"/%3E%3Ctext fill="%2394a3b8" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3EError%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-red-500">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-xs mt-1">Missing</span>
                        </div>
                      )}
                      {/* Label Badge Overlay */}
                      <div className="absolute top-2 left-2">
                        {item.label === 1 ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                            ✓ Labeled
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                            Pending
                          </span>
                        )}
                      </div>
                      {/* View Full Button */}
                      {item.image_exists && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-lg">
                            View Full
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Info */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-slate-500">#{item.id}</span>
                        <span className="text-xs text-slate-400">User {item.user_id}</span>
                      </div>
                      
                      {item.disease_code && (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                            {item.disease_code}
                          </span>
                          {item.confidence && (
                            <span className="text-xs text-slate-400">{item.confidence.toFixed(1)}%</span>
                          )}
                        </div>
                      )}

                      {item.created_at && (
                        <div className="text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={getImageUrl(selectedImage)}
              alt="Preview"
              className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-3 text-white/70 text-sm text-center font-mono bg-black/50 py-2 px-4 rounded-lg inline-block">
              {selectedImage.split('/').pop()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
