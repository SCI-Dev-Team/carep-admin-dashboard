import type { Metadata } from "next";
import { brand } from "@/app/lib/brand";
import { AuthProvider } from "../components/layout/AuthContext";

export const metadata: Metadata = {
  title: `Dashboard - ${brand.projectName}`,
  description: `${brand.projectName} Dashboard`,
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthProvider>{children}</AuthProvider>;
}
