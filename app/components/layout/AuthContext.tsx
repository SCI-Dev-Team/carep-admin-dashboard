"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextValue = {
  authed: boolean;
  basicAuth?: string | null;
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [basicAuth, setBasicAuth] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("basic_auth");
    if (stored) {
      setBasicAuth(stored);
      setAuthed(true);
    }
  }, []);

  async function login(username: string, password: string) {
    const encoded = btoa(`${username}:${password}`);
    // try to call a lightweight protected endpoint to verify credentials
    const res = await fetch("/api/analytics", {
      headers: { Authorization: "Basic " + encoded },
    });
    if (!res.ok) {
      throw new Error(await res.text().catch(() => "Unauthorized"));
    }
    const data = await res.json();
    sessionStorage.setItem("basic_auth", encoded);
    setBasicAuth(encoded);
    setAuthed(true);
    return data;
  }

  function logout() {
    sessionStorage.removeItem("basic_auth");
    setBasicAuth(null);
    setAuthed(false);
  }

  return (
    <AuthContext.Provider value={{ authed, basicAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


