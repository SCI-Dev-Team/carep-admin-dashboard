import { marqueeDiseases } from "../constants";
import { LeafIcon } from "../icons";
import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function DiseaseMarqueeSection() {
  const { copy, locale } = useLandingI18n();

  return (
    <section className="py-20 bg-emerald-900 overflow-hidden">
      <ScrollReveal className="max-w-7xl mx-auto px-6 text-center mb-10">
        <p className="text-emerald-300 font-bold text-xs uppercase tracking-widest mb-3">
          {copy.diseaseMarquee.badge}
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
          {copy.diseaseMarquee.title}
        </h2>
        <p className="text-emerald-200/75 text-sm max-w-lg mx-auto">
          {copy.diseaseMarquee.description}
        </p>
      </ScrollReveal>

      <ScrollReveal className="relative overflow-hidden" delayMs={100}>
        <div className="flex gap-4 marquee-track w-max">
          {[...marqueeDiseases, ...marqueeDiseases].map((disease, i) => (
            <div
              key={`${disease.en}-${i}`}
              className="shrink-0 flex items-center gap-2.5 bg-emerald-800/60 border border-emerald-700/60 text-emerald-100 rounded-full px-5 py-2.5 text-sm font-medium whitespace-normal max-w-[min(92vw,24rem)] sm:max-w-md text-start"
            >
              <LeafIcon className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="leading-snug">
                {locale === "km" ? disease.km : disease.en}
              </span>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
