"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { brand } from "@/app/lib/brand";
import { toast } from "react-toastify";

type Disease = {
  id: number;
  disease_code: string;
  disease_en: string;
  dieseas_km?: string;
  cure?: string;
  symptom?: string;
  reference?: string;
  status?: number;
};

export default function CauliCrud({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<Disease[]>([]);
  const [crop, setCrop] = useState<"cauliflower" | "cucumber" | "cabbage">("cauliflower");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Disease | null>(null);
  const [form, setForm] = useState<Partial<Disease>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    fetchList();
    setEditing(null);
    setExpandedId(null);
  }, [crop]);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cauliflower?crop=${crop}`);
      const json = await res.json();
      setItems(json);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item?: Disease) {
    if (item) {
      setEditing(item);
      setForm({ ...item });
    } else {
      const empty: Partial<Disease> = { id: 0, disease_code: "", disease_en: "", status: 1 };
      setEditing(empty as Disease);
      setForm(empty);
    }
  }

  async function save() {
    try {
      if (editing) {
        await fetch(`/api/cauliflower?crop=${crop}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch(`/api/cauliflower?crop=${crop}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      await fetchList();
      setEditing(null);
      setForm({});
      toast.success(editing?.id && editing.id > 0 ? "Disease updated" : "Disease added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete record " + id + "?")) return;
    try {
      await fetch(`/api/cauliflower?id=${id}&crop=${crop}`, { method: "DELETE" });
      await fetchList();
      toast.success("Record deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  }

  const activeCount = items.filter((d) => d.status === 1).length;
  const inactiveCount = items.filter((d) => d.status === 0).length;

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-slate-100">
              <Image src={brand.logo} alt={brand.projectName} width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Disease Management</h1>
              <p className="text-sm text-slate-500 mt-0.5">{brand.projectName} Project - {brand.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Crop Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setCrop("cauliflower")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  crop === "cauliflower"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                🥦 Cauliflower
              </button>
              <button
                onClick={() => setCrop("cucumber")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  crop === "cucumber"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                🥒 Cucumber
              </button>
            </div>
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
              onClick={() => startEdit()} 
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Disease
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
        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Diseases</p>
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
                <p className="text-sm font-medium text-slate-500">Active</p>
                <p className="text-3xl font-bold text-emerald-600">{activeCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Inactive</p>
                <p className="text-3xl font-bold text-slate-500">{inactiveCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editing !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setEditing(null); setForm({}); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">
                  {editing.id && editing.id > 0 ? "Edit Disease" : "Add New Disease"}
                </h2>
                <button onClick={() => { setEditing(null); setForm({}); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Disease Code</label>
                    <input 
                      value={form.disease_code ?? ""} 
                      onChange={(e) => setForm({ ...form, disease_code: e.target.value })} 
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-mono"
                      placeholder="e.g., BLK_ROT"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                    <select 
                      value={form.status ?? 1} 
                      onChange={(e) => setForm({ ...form, status: Number(e.target.value) })} 
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Name (English)</label>
                  <input 
                    value={form.disease_en ?? ""} 
                    onChange={(e) => setForm({ ...form, disease_en: e.target.value })} 
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Disease name in English"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Name (Khmer)</label>
                  <input 
                    value={form.dieseas_km ?? ""} 
                    onChange={(e) => setForm({ ...form, dieseas_km: e.target.value })} 
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="ឈ្មោះជំងឺជាភាសាខ្មែរ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Symptoms</label>
                  <textarea 
                    value={form.symptom ?? ""} 
                    onChange={(e) => setForm({ ...form, symptom: e.target.value })} 
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none"
                    placeholder="Describe the symptoms..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Cure / Treatment</label>
                  <textarea 
                    value={form.cure ?? ""} 
                    onChange={(e) => setForm({ ...form, cure: e.target.value })} 
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none"
                    placeholder="Describe the treatment..."
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                <button 
                  onClick={() => { setEditing(null); setForm({}); }} 
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={save} 
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700"
                >
                  {editing.id && editing.id > 0 ? "Save Changes" : "Add Disease"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Disease Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-700">
              {crop === "cauliflower" ? "🥦 Cauliflower" : "🥒 Cucumber"} Diseases
            </h3>
          </div>
          <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 480px)" }}>
            {loading ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-slate-500">Loading diseases...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className="text-sm text-slate-500">No diseases found</span>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Code</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Symptoms</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((disease) => (
                    <React.Fragment key={disease.id}>
                      <tr 
                        className="hover:bg-emerald-50/50 cursor-pointer transition-colors"
                        onClick={() => setExpandedId(expandedId === disease.id ? null : disease.id)}
                      >
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-md bg-purple-100 px-2.5 py-1 text-xs font-mono font-medium text-purple-700">
                            {disease.disease_code}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{disease.disease_en}</p>
                            {disease.dieseas_km && (
                              <p className="text-sm text-slate-500 mt-0.5">{disease.dieseas_km}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-600 line-clamp-2 max-w-md">
                            {disease.symptom || <span className="text-slate-400 italic">No symptoms listed</span>}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            disease.status === 1
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {disease.status === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => startEdit(disease)} 
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-700"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button 
                              onClick={() => remove(disease.id)} 
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Details */}
                      {expandedId === disease.id && (
                        <tr className="bg-slate-50">
                          <td colSpan={5} className="px-5 py-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Symptoms</h4>
                                <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                                  {disease.symptom || <span className="text-slate-400 italic">No symptoms listed</span>}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cure / Treatment</h4>
                                <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                                  {disease.cure || <span className="text-slate-400 italic">No treatment listed</span>}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


