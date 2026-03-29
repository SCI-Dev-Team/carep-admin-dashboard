import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function StatsBarSection() {
  const { copy } = useLandingI18n();

  return (
    <section className="bg-linear-to-r from-emerald-900 via-emerald-700 to-emerald-600 py-14">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {copy.stats.items.map((s, i) => (
          <ScrollReveal key={s.label} delayMs={i * 90}>
            <div>
            <p className="text-4xl md:text-5xl font-black text-white tracking-tight">{s.value}</p>
            <p className="text-white/80 text-sm mt-1 font-medium">{s.label}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
