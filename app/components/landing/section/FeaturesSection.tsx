import { CpuChipIcon, DocumentTextIcon, SparklesIcon, SpeakerWaveIcon } from "../icons";
import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function FeaturesSection() {
  const { copy } = useLandingI18n();

  return (
    <section id="features" className="scroll-mt-28 py-28 px-6 bg-linear-to-br from-amber-50 via-emerald-50/40 to-lime-50/50">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-20">
          <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">
            {copy.features.badge}
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-emerald-950 mb-4 tracking-tight">
            {copy.features.title}
          </h2>
          <p className="text-lg text-emerald-800/70 max-w-xl mx-auto">
            {copy.features.description}
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {copy.features.items.map((feature, i) => {
            const styles = [
              {
                icon: <CpuChipIcon className="w-6 h-6" />,
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-700",
                border: "border-emerald-200",
                tagColor: "bg-emerald-100 text-emerald-700",
              },
              {
                icon: <SparklesIcon className="w-6 h-6" />,
                iconBg: "bg-amber-100",
                iconColor: "text-amber-700",
                border: "border-amber-200",
                tagColor: "bg-amber-100 text-amber-700",
              },
              {
                icon: <DocumentTextIcon className="w-6 h-6" />,
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-700",
                border: "border-green-200",
                tagColor: "bg-emerald-100 text-emerald-700",
              },
              {
                icon: <SpeakerWaveIcon className="w-6 h-6" />,
                iconBg: "bg-sky-100",
                iconColor: "text-sky-800",
                border: "border-sky-200",
                tagColor: "bg-sky-100 text-sky-800",
              },
            ] as const;
            const style = styles[i] ?? styles[0];

            return (
            <ScrollReveal key={feature.title} delayMs={i * 120}>
              <div
              className={`bg-white border ${style.border} rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 group`}
            >
              <div className={`w-12 h-12 ${style.iconBg} ${style.iconColor} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {style.icon}
              </div>
              <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-4 ${style.tagColor}`}>
                {feature.tag}
              </span>
              <h3 className="text-xl font-black text-emerald-950 mb-3">{feature.title}</h3>
              <p className="text-emerald-800/70 leading-relaxed text-sm">{feature.description}</p>
              </div>
            </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
