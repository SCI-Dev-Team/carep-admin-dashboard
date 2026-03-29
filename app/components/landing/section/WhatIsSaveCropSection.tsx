import Image from "next/image";
import { BoltIcon, CheckBadgeIcon, LeafIcon } from "../icons";
import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function WhatIsSaveCropSection() {
  const { copy } = useLandingI18n();

  return (
    <section id="what-is-save-crop" className="scroll-mt-28 py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-14">
          <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">
            {copy.whatIs.badge}
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-emerald-950 mb-4 tracking-tight">
            {copy.whatIs.title}
          </h2>
          <p className="text-lg text-emerald-800/70 max-w-3xl mx-auto leading-relaxed">
            {copy.whatIs.description}
          </p>
        </ScrollReveal>

        <ScrollReveal className="mb-10 flex justify-center" delayMs={80}>
          <div className="w-full max-w-md rounded-3xl bg-linear-to-br from-white to-emerald-50 border border-emerald-100 p-6 shadow-sm">
            <div className="aspect-4/3 rounded-2xl overflow-hidden bg-white border border-emerald-100">
              <Image
                src="/logo/logo.png"
                alt="Save Crop logo"
                width={1023}
                height={1023}
                className="w-full h-full object-contain p-5"
              />
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {copy.whatIs.points.map((point, i) => (
            <ScrollReveal key={point.title} delayMs={i * 100} className="h-full">
              <article
              className="bg-linear-to-br from-white to-emerald-50 border border-emerald-100 rounded-3xl p-7 shadow-sm hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                {i === 0 && <LeafIcon className="w-5 h-5" />}
                {i === 1 && <BoltIcon className="w-5 h-5" />}
                {i === 2 && <CheckBadgeIcon className="w-5 h-5" />}
              </div>
              <h3 className="text-xl font-black text-emerald-950 mb-2">{point.title}</h3>
              <p className="text-sm text-emerald-800/70 leading-relaxed">{point.description}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
