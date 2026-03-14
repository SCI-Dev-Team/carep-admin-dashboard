/**
 * Project branding: name, tagline, logo.
 * Edit these to match your project.
 * Theme: primary color is set in app/globals.css (--brand-green-*). To change theme color,
 * update those CSS variables and optionally replace "emerald" with another Tailwind color (e.g. "blue") across components.
 */
export const brand = {
  /** Project name shown in sidebar, login, and page titles */
  projectName: "Save Crops",
  /** Short tagline for headers and footers */
  tagline: "Protecting crops, supporting farmers",
  /** Logo image path (public folder). Use the new logo in public/logo/ */
  logo: "/logo/logo.png",
  /** Subtitle under project name in sidebar */
  dashboardSubtitle: "Admin Dashboard",
} as const;
