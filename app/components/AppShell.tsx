"use client";

import React, { useState } from "react";
import AnalyticsDashboard from "./AnalyticsDashboard";
import CauliCrud from "./CauliCrud";
import { AuthProvider } from "./AuthContext";

export default function AppShell() {
  const [tab, setTab] = useState<"analytics" | "diseases">("analytics");

  return (
    <AuthProvider>
      <div className="min-h-screen flex bg-green-50">
        <aside className="w-64 border-r bg-white/70 p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-green-800">Admin</h2>
            <p className="text-xs text-green-600">Analytics & Management</p>
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
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {tab === "analytics" ? <AnalyticsDashboard /> : <CauliCrud onClose={() => setTab("analytics")} />}
        </main>
      </div>
    </AuthProvider>
  );
}


