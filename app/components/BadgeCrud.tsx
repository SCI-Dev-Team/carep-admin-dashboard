 "use client";

import React, { useEffect, useState } from "react";

type Badge = {
  id: number;
  name: string;
  name_km?: string;
  slug: string;
  criteria_type: "streak_days" | "images_uploaded";
  criteria_value: number;
  description?: string;
  icon?: string;
  created_at?: string;
};

export default function BadgeCrud({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Badge | null>(null);
  const [form, setForm] = useState<Partial<Badge>>({});

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/badges");
      const json = await res.json();
      setItems(json);
    } catch (err) {
      console.error(err);
      setError("Failed to load badges");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item?: Badge) {
    if (item) {
      setEditing(item);
      setForm({ ...item });
    } else {
      const empty: Partial<Badge> = {
        id: 0,
        name: "",
        name_km: "",
        slug: "",
        criteria_type: "streak_days",
        criteria_value: 0,
        description: "",
        icon: "",
      };
      setEditing(empty as Badge);
      setForm(empty);
    }
  }

  async function save() {
    setError(null);
    try {
      // If editing existing badge (has positive id) -> PUT, otherwise POST
      if (editing && editing.id && editing.id > 0) {
        await fetch(`/api/badges?id=${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/badges", {
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
      setError("Failed to save badge");
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete badge " + id + "?")) return;
    try {
      await fetch(`/api/badges?id=${id}`, { method: "DELETE" });
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
          <h3 className="text-lg font-semibold text-green-800">Badge Management</h3>
          <p className="text-xs text-green-600">Manage achievement badges</p>
        </div>
        <div className="flex items-center gap-2">
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

            <label className="block text-xs text-green-700">Name (EN)</label>
            <input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded border px-2 py-1" />

            <label className="block text-xs text-green-700">Name (KM)</label>
            <input value={form.name_km ?? ""} onChange={(e) => setForm({ ...form, name_km: e.target.value })} className="w-full rounded border px-2 py-1" />

            <label className="block text-xs text-green-700">Slug</label>
            <input value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded border px-2 py-1" />

            <label className="block text-xs text-green-700">Criteria Type</label>
            <select value={form.criteria_type ?? "streak_days"} onChange={(e) => setForm({ ...form, criteria_type: e.target.value as any })} className="w-full rounded border px-2 py-1">
              <option value="streak_days">streak_days</option>
              <option value="images_uploaded">images_uploaded</option>
            </select>

            <label className="block text-xs text-green-700">Criteria Value</label>
            <input type="number" value={form.criteria_value ?? 0} onChange={(e) => setForm({ ...form, criteria_value: Number(e.target.value) })} className="w-full rounded border px-2 py-1" />

            <label className="block text-xs text-green-700">Icon</label>
            <input value={form.icon ?? ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full rounded border px-2 py-1" />

            <label className="block text-xs text-green-700">Description</label>
            <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded border px-2 py-1" />

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
                  <th className="p-1">Name</th>
                  <th className="p-1">Slug</th>
                  <th className="p-1">Criteria</th>
                  <th className="p-1">Icon</th>
                  <th className="p-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="even:bg-green-50 align-top">
                    <td className="p-1 align-top">{it.id}</td>
                    <td className="p-1 align-top">{it.name}</td>
                    <td className="p-1 align-top">{it.slug}</td>
                    <td className="p-1 align-top">{it.criteria_type}={it.criteria_value}</td>
                    <td className="p-1 align-top">{it.icon}</td>
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

