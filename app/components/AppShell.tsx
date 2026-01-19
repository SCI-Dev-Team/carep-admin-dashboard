"use client";

import React, { useState } from "react";
import AnalyticsDashboard from "./AnalyticsDashboard";
import CauliCrud from "./CauliCrud";
// @ts-ignore - badge CRUD component is added in this workspace
import BadgeCrud from "./BadgeCrud";
import { AuthProvider } from "./AuthContext";

export default function AppShell() {
  const [tab, setTab] = useState<"analytics" | "diseases" | "badges">("analytics");

  return (
    <AuthProvider>
      <div className="min-h-screen flex bg-green-50">
        <aside className="w-64 border-r bg-white/70 p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-green-800">CAREP Admin</h2>
            <p className="text-xs text-green-600">Analytics & Management</p>
            <p className="text-xs text-green-500 mt-1">Save the Children</p>
          </div>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setTab("analytics")}
              className={
                "text-left rounded px-3 py-2 " +
                (tab === "analytics" ? "bg-green-100 text-green-800" : "text-green-700 hover:bg-green-50")
              }
            >
              Analytics Dashboard
            </button>
            <button
              onClick={() => setTab("diseases")}
              className={
                "text-left rounded px-3 py-2 " +
                (tab === "diseases" ? "bg-green-100 text-green-800" : "text-green-700 hover:bg-green-50")
              }
            >
              Disease Management
            </button>
            <button
              onClick={() => setTab("badges")}
              className={
                "text-left rounded px-3 py-2 " +
                (tab === "badges" ? "bg-green-100 text-green-800" : "text-green-700 hover:bg-green-50")
              }
            >
              Badge Management
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {tab === "analytics" ? (
            <AnalyticsDashboard />
          ) : tab === "diseases" ? (
            <CauliCrud onClose={() => setTab("analytics")} />
          ) : (
            <BadgeCrud onClose={() => setTab("analytics")} />
          )}
        </main>
      </div>
    </AuthProvider>
  );
}


