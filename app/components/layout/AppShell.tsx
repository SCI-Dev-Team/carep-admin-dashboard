"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AuthProvider } from "./AuthContext";
import { brand } from "@/app/lib/brand";

const AnalyticsDashboard = dynamic(() => import("../analytics/AnalyticsDashboard"), { ssr: false });
const CauliCrud = dynamic(() => import("../diseases/CauliCrud"), { ssr: false });
const BadgeCrud = dynamic(() => import("../badges/BadgeCrud"), { ssr: false });
const ImageManagement = dynamic(() => import("../images/ImageManagement"), { ssr: false });
const UserManagement = dynamic(() => import("../users/UserManagement"), { ssr: false });
const TopContributors = dynamic(() => import("../users/TopContributors"), { ssr: false });
const NotificationManagement = dynamic(() => import("../notifications/NotificationManagement"), { ssr: false });
const WeatherDashboard = dynamic(() => import("../weather/WeatherDashboard"), { ssr: false });
const WeatherAlerts = dynamic(() => import("../weather/WeatherAlerts"), { ssr: false });

type TabId = "analytics" | "diseases" | "badges" | "images" | "users" | "contributors" | "notifications" | "weather" | "alerts";

export default function AppShell() {
  const [tab, setTab] = useState<TabId>("analytics");
  const [visitedTabs, setVisitedTabs] = useState<Set<TabId>>(() => new Set(["analytics"]));

  const handleTabChange = (tabId: TabId) => {
    setTab(tabId);
    setVisitedTabs((prev) => new Set(prev).add(tabId));
  };

  const navItems = [
    { 
      id: "analytics" as const, 
      label: "Analytics", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: "diseases" as const, 
      label: "Diseases", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    { 
      id: "badges" as const, 
      label: "Badges", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    },
    { 
      id: "images" as const, 
      label: "Images", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: "users" as const, 
      label: "Users", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      id: "contributors" as const, 
      label: "Top Contributors", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    { 
      id: "notifications" as const, 
      label: "Notifications", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    { 
      id: "weather" as const, 
      label: "Weather", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      )
    },
    { 
      id: "alerts" as const, 
      label: "Weather Alerts", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
  ];

  return (
    <AuthProvider>
      <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col">
          {/* Logo */}
          <div className="p-5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-slate-100 shrink-0">
                <Image src={brand.logo} alt={brand.projectName} width={40} height={40} className="object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-slate-800 truncate">{brand.projectName}</h1>
                <p className="text-xs text-slate-500">{brand.dashboardSubtitle}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">{brand.tagline}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Menu</p>
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    tab === item.id 
                      ? "bg-emerald-50 text-emerald-700 shadow-sm" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={tab === item.id ? "text-emerald-600" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  {item.label}
                  {tab === item.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-medium text-slate-600">Need help?</p>
              <p className="text-xs text-slate-400 mt-0.5">Contact support@carep.org</p>
            </div>
          </div>
        </aside>

        {/* Main Content: only mount visited tabs, hide inactive so state is preserved and no refetch on switch */}
        <main className="flex-1 overflow-auto">
          {visitedTabs.has("analytics") && (
            <div className="h-full" style={{ display: tab === "analytics" ? "block" : "none" }}>
              <AnalyticsDashboard />
            </div>
          )}
          {visitedTabs.has("diseases") && (
            <div className="h-full" style={{ display: tab === "diseases" ? "block" : "none" }}>
              <CauliCrud onClose={() => setTab("analytics")} />
            </div>
          )}
          {visitedTabs.has("badges") && (
            <div className="h-full" style={{ display: tab === "badges" ? "block" : "none" }}>
              <BadgeCrud onClose={() => setTab("analytics")} />
            </div>
          )}
          {visitedTabs.has("images") && (
            <div className="h-full" style={{ display: tab === "images" ? "block" : "none" }}>
              <ImageManagement onClose={() => setTab("analytics")} />
            </div>
          )}
          {visitedTabs.has("users") && (
            <div className="h-full" style={{ display: tab === "users" ? "block" : "none" }}>
              <UserManagement onClose={() => setTab("analytics")} />
            </div>
          )}
          {visitedTabs.has("contributors") && (
            <div className="h-full" style={{ display: tab === "contributors" ? "block" : "none" }}>
              <TopContributors onClose={() => setTab("analytics")} />
            </div>
          )}
          {visitedTabs.has("notifications") && (
            <div className="h-full" style={{ display: tab === "notifications" ? "block" : "none" }}>
              <NotificationManagement onClose={() => setTab("analytics")} />
            </div>
          )}
          {visitedTabs.has("weather") && (
            <div className="h-full" style={{ display: tab === "weather" ? "block" : "none" }}>
              <WeatherDashboard onClose={() => setTab("analytics")} />
            </div>
          )}
          {visitedTabs.has("alerts") && (
            <div className="h-full" style={{ display: tab === "alerts" ? "block" : "none" }}>
              <WeatherAlerts onClose={() => setTab("analytics")} />
            </div>
          )}
        </main>
      </div>
    </AuthProvider>
  );
}


