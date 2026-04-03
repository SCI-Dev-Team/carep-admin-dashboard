import Image from "next/image";
import { BoltIcon, CheckBadgeIcon, LeafIcon } from "../icons";
import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function WhatIsSaveCropSection() {
  const { copy } = useLandingI18n();

  return (
    <section id="what-is-save-crop" className="scroll-mt-28 py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <ScrollReveal className="lg:col-span-5">
            <div className="overflow-hidden">
              <div>
                <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest">
                  {copy.whatIs.badge}
                </p>
                <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 mt-2 tracking-tight">
                  {copy.whatIs.title}
                </h2>
              </div>

              <div className="p-6">
                <div className="aspect-4/3 rounded-2xl overflow-hidden ">
                  <Image
                    src="/logo/logo.png"
                    alt="Save Crop logo"
                    width={1023}
                    height={1023}
                    className="w-full h-full object-contain p-6"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="lg:col-span-7">
            <ScrollReveal>
              <p className="text-lg text-emerald-900/75 leading-relaxed mb-8">
                {copy.whatIs.description}
              </p>
            </ScrollReveal>

            <div className="space-y-4">
              {copy.whatIs.points.map((point, i) => (
                <ScrollReveal key={point.title} delayMs={i * 90}>
                  <div className="flex gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm hover:shadow-md hover:shadow-emerald-100/60 transition-all">
                    <div className="mt-0.5 w-11 h-11 shrink-0 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
                      {i === 0 && <LeafIcon className="w-5 h-5" />}
                      {i === 1 && <BoltIcon className="w-5 h-5" />}
                      {i === 2 && <CheckBadgeIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-emerald-950 leading-snug">
                        {point.title}
                      </h3>
                      <p className="text-sm text-emerald-900/70 leading-relaxed mt-1">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
