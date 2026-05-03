"use client";

import { useEffect, useState } from "react";
import {
  AcknowledgementSection,
  CTASection,
  DiseaseMarqueeSection,
  FeaturesSection,
  FooterSection,
  HeroSection,
  HowItWorksSection,
  Navigation,
  OurStorySection,
  StatsBarSection,
  SupportedCropsSection,
  WhatIsSaveCropSection,
} from "./section";
import { LandingI18nProvider } from "./i18n";

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onAnchorClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const id = decodeURIComponent(href.slice(1));
      const section = document.getElementById(id);
      if (!section) return;

      event.preventDefault();
      const top = section.getBoundingClientRect().top + window.scrollY - 96;
      const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";

      window.scrollTo({ top: Math.max(0, top), behavior });
      window.history.replaceState(null, "", `#${id}`);
    };

    document.addEventListener("click", onAnchorClick);
    return () => document.removeEventListener("click", onAnchorClick);
  }, []);

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Kantumruy Pro';
          src: url('/font/Kantumruy_Pro/KantumruyPro-VariableFont_wght.ttf') format('truetype');
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Google Sans';
          src: url('/font/Google_Sans/GoogleSans-VariableFont_GRAD,opsz,wght.ttf') format('truetype');
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }
        .landing-font-scope {
          font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .landing-font-scope h1,
        .landing-font-scope h2,
        .landing-font-scope h3,
        .landing-font-scope h4,
        .landing-font-scope h5,
        .landing-font-scope h6 {
          font-family: 'Kantumruy Pro', 'Google Sans', sans-serif;
          letter-spacing: -0.01em;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 30s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>

      <LandingI18nProvider>
        <div className="landing-font-scope min-h-screen bg-[#f7faf5] antialiased">
          <Navigation scrolled={scrolled} />
          <HeroSection />
          <StatsBarSection />
          <WhatIsSaveCropSection />
          <HowItWorksSection />
          <FeaturesSection />
          <DiseaseMarqueeSection />
          <SupportedCropsSection />
          <OurStorySection />
          <CTASection />
          <AcknowledgementSection />
          <FooterSection />
        </div>
      </LandingI18nProvider>
    </>
  );
}
