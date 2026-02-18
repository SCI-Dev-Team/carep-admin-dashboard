"use client";

import React, { useEffect, useState } from "react";

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
  const [error, setError] = useState<string | null>(null);
  const [filterLabel, setFilterLabel] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const pageSize = 20;

  useEffect(() => {
    fetchList();
  }, [filterLabel, page]);

  async function fetchList() {
    setLoading(true);
    setError(null);
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
      setError("Failed to load images");
    } finally {
      setLoading(false);
    }
  }

  async function toggleLabel(id: number, currentLabel: number) {
    setError(null);
    try {
      await fetch(`/api/images?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: currentLabel === 1 ? 0 : 1 }),
      });
      await fetchList();
    } catch (err) {
      console.error(err);
      setError("Failed to update label");
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this upload? This will also delete the image file.")) return;
    try {
      await fetch(`/api/images?id=${id}`, { method: "DELETE" });
      await fetchList();
    } catch (err) {
      console.error(err);
      setError("Failed to delete");
    }
  }

  function getImageUrl(imageFile: string): string {
    // Use the API endpoint to serve images from the filesystem
    return `/api/images/serve?path=${encodeURIComponent(imageFile)}`;
  }

  return (
    <div className="h-full w-full bg-white shadow-lg">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="text-lg font-semibold text-green-800">Image Management</h3>
          <p className="text-xs text-green-600">Manage and label user uploaded images</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchList()} className="rounded border px-2 py-1 text-sm text-green-700">
            Refresh
          </button>
          <button onClick={onClose} className="rounded border px-2 py-1 text-sm text-red-700">
            Close
          </button>
        </div>
      </div>

      <div className="border-b px-4 py-2 flex items-center gap-4">
        <label className="text-sm text-green-700">Filter:</label>
        <select
          value={filterLabel}
          onChange={(e) => {
            setFilterLabel(e.target.value);
            setPage(0);
          }}
          className="rounded border px-2 py-1 text-sm"
        >
          <option value="all">All Images</option>
          <option value="0">Unlabeled</option>
          <option value="1">Labeled/Correct</option>
        </select>
        
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded border px-2 py-1 text-sm text-green-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-green-700">Page {page + 1}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={items.length < pageSize}
            className="rounded border px-2 py-1 text-sm text-green-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="p-3">
        {error ? <div className="mb-2 text-sm text-red-600">{error}</div> : null}

        {loading ? (
          <div className="text-sm text-green-600">Loading…</div>
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-xs text-green-700 border-b">
                  <th className="p-2">ID</th>
                  <th className="p-2">Preview</th>
                  <th className="p-2">User ID</th>
                  <th className="p-2">Disease</th>
                  <th className="p-2">Confidence</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Labeled</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="even:bg-green-50 border-b hover:bg-green-100">
                    <td className="p-2">{it.id}</td>
                    <td className="p-2">
                      <div className="flex flex-col gap-1">
                        {it.image_exists ? (
                          <>
                            <div 
                              onClick={() => setSelectedImage(it.image_file)}
                              className="cursor-pointer border-2 border-gray-300 rounded overflow-hidden hover:border-green-500 transition-colors"
                              style={{ width: '100px', height: '100px' }}
                            >
                              <img
                                src={getImageUrl(it.image_file)}
                                alt={`Upload ${it.id}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                            <button
                              onClick={() => setSelectedImage(it.image_file)}
                              className="text-blue-600 hover:underline text-xs"
                            >
                              View Full
                            </button>
                          </>
                        ) : (
                          <div className="w-[100px] h-[100px] bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-red-600 text-xs text-center">Image Missing</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 max-w-[100px] truncate" title={it.image_file}>
                          {it.image_file.split('/').pop()}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-xs">
                        <div className="font-semibold">{it.user_id}</div>
                        {it.image_exists ? (
                          <span className="inline-block px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 mt-1">
                            ✓ Exists
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-xs bg-red-100 text-red-800 mt-1">
                            ✗ Missing
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-xs">
                        <div className="font-semibold">{it.disease_code || "N/A"}</div>
                        {it.disease_name && it.disease_name !== it.disease_code && (
                          <div className="text-green-600 mt-0.5">{it.disease_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      {it.confidence ? (
                        <span className="text-xs font-semibold">{it.confidence.toFixed(2)}%</span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-2">
                      <div className="text-xs">
                        {it.created_at ? (
                          <>
                            <div>{new Date(it.created_at).toLocaleDateString()}</div>
                            <div className="text-gray-500">{new Date(it.created_at).toLocaleTimeString()}</div>
                          </>
                        ) : "N/A"}
                      </div>
                    </td>
                    <td className="p-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={it.label === 1}
                          onChange={() => toggleLabel(it.id, it.label)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs">{it.label === 1 ? "✓ Correct" : "Unlabeled"}</span>
                      </label>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => remove(it.id)}
                        className="rounded border px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {items.length === 0 && !loading && (
              <div className="text-center py-8 text-sm text-green-600">
                No images found
              </div>
            )}
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-gray-200"
            >
              ×
            </button>
            <img
              src={getImageUrl(selectedImage)}
              alt="Upload preview"
              className="max-w-full max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-2 text-white text-sm text-center bg-black bg-opacity-50 p-2 rounded">
              {selectedImage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
