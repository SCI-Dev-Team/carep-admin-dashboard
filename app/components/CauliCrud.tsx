"use client";

import React, { useEffect, useState } from "react";

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
  const [crop, setCrop] = useState<"cauliflower" | "cucumber">("cauliflower");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Disease | null>(null);
  const [form, setForm] = useState<Partial<Disease>>({});

  useEffect(() => {
    fetchList();
  }, []);

  // re-fetch list whenever crop changes
  useEffect(() => {
    fetchList();
    // clear any open editor when switching crops
    setEditing(null);
  }, [crop]);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cauliflower?crop=${crop}`);
      const json = await res.json();
      setItems(json);
    } catch (err) {
      console.error(err);
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item?: Disease) {
    // if item provided, edit existing; otherwise start a new empty record
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
    setError(null);
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
    } catch (err) {
      console.error(err);
      setError("Failed to save");
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete record " + id + "?")) return;
    try {
      await fetch(`/api/cauliflower?id=${id}&crop=${crop}`, { method: "DELETE" });
      await fetchList();
    } catch (err) {
      console.error(err);
      setError("Failed to delete");
    }
  }

  return (
    <div className="h-full w-full bg-white shadow-lg">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="text-lg font-semibold text-green-800">Disease Management</h3>
          <p className="text-xs text-green-600">CAREP Project - Save the Children</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={crop} onChange={(e) => setCrop(e.target.value as any)} className="rounded border px-2 py-1 text-sm">
            <option value="cauliflower">Cauliflower</option>
            <option value="cucumber">Cucumber</option>
          </select>
          <button onClick={() => fetchList()} className="rounded border px-2 py-1 text-sm text-green-700">Refresh</button>
          <button onClick={() => startEdit()} className="rounded border px-2 py-1 text-sm text-green-700">New</button>
          <button onClick={onClose} className="rounded border px-2 py-1 text-sm text-red-700">Close</button>
        </div>
      </div>
      <div className="p-3">
        {error ? <div className="mb-2 text-sm text-red-600">{error}</div> : null}
        {editing !== null ? (
          <div className="space-y-2">
            <label className="block text-xs text-green-700">ID</label>
            <input value={form.id ?? ""} onChange={(e) => setForm({ ...form, id: Number(e.target.value) })} className="w-full rounded border px-2 py-1" />
            <label className="block text-xs text-green-700">Code</label>
            <input value={form.disease_code ?? ""} onChange={(e) => setForm({ ...form, disease_code: e.target.value })} className="w-full rounded border px-2 py-1" />
            <label className="block text-xs text-green-700">English</label>
            <input value={form.disease_en ?? ""} onChange={(e) => setForm({ ...form, disease_en: e.target.value })} className="w-full rounded border px-2 py-1" />
            <label className="block text-xs text-green-700">Khmer</label>
            <input value={form.dieseas_km ?? ""} onChange={(e) => setForm({ ...form, dieseas_km: e.target.value })} className="w-full rounded border px-2 py-1" />
            <label className="block text-xs text-green-700">Symptom</label>
            <textarea value={form.symptom ?? ""} onChange={(e) => setForm({ ...form, symptom: e.target.value })} className="w-full rounded border px-2 py-1" />
            <label className="block text-xs text-green-700">Cure</label>
            <textarea value={form.cure ?? ""} onChange={(e) => setForm({ ...form, cure: e.target.value })} className="w-full rounded border px-2 py-1" />
            <div className="flex items-center gap-2">
              <button onClick={save} className="rounded bg-green-600 px-3 py-1 text-white text-sm">Save</button>
              <button onClick={() => { setEditing(null); setForm({}); }} className="rounded border px-3 py-1 text-sm">Cancel</button>
            </div>
          </div>
        ) : null}

        <div className="mt-3 max-h-[60vh] overflow-auto">
          {loading ? <div className="text-sm text-green-600">Loading…</div> : (
            <table className="w-full text-sm">
            <thead>
                <tr className="text-left text-xs text-green-700">
                  <th className="p-1">ID</th>
                  <th className="p-1">Code</th>
                  <th className="p-1">EN</th>
                  <th className="p-1">Symptom</th>
                  <th className="p-1">Cure</th>
                  <th className="p-1">Status</th>
                  <th className="p-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="even:bg-green-50 align-top">
                    <td className="p-1 align-top">{it.id}</td>
                    <td className="p-1 align-top">{it.disease_code}</td>
                    <td className="p-1 align-top">{it.disease_en}</td>
                    <td className="p-1 align-top">{String(it.symptom ?? "").slice(0, 60)}</td>
                    <td className="p-1 align-top">{String(it.cure ?? "").slice(0, 60)}</td>
                    <td className="p-1 align-top">{it.status}</td>
                    <td className="p-1 align-top">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(it)} className="rounded border px-2 py-0.5 text-xs text-green-700">Edit</button>
                        <button onClick={() => remove(it.id)} className="rounded border px-2 py-0.5 text-xs text-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


