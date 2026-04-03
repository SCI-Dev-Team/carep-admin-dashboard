import { CameraIcon, DocumentTextIcon, TelegramIcon } from "../icons";
import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function HowItWorksSection() {
  const { copy } = useLandingI18n();

  return (
    <section id="how-it-works" className="scroll-mt-28 py-28 px-6 bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-14 lg:mb-16">
          <p className="text-emerald-200 font-bold text-xs uppercase tracking-widest mb-3">
            {copy.howItWorks.badge}
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {copy.howItWorks.title}
          </h2>
          <p className="text-lg text-white/85 max-w-xl mx-auto">
            {copy.howItWorks.description}
          </p>
        </ScrollReveal>

        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:justify-center lg:items-stretch lg:gap-12">
          <ScrollReveal className="w-full max-w-[480px] shrink-0 flex flex-col">
            <div className="flex flex-col rounded-[28px]">
              <div className="relative aspect-9/16 w-full max-h-[min(92dvh,960px)] overflow-hidden rounded-[27px] ">
                <video
                  className="absolute inset-0 h-full w-full object-contain rounded-[27px]"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  aria-label="How to use Save Crop"
                >
                  <source src="/video/IMG_7526.MP4" type="video/mp4" />
                </video>
              </div>
            </div>
          </ScrollReveal>

          <div className="flex w-full max-w-sm shrink-0 flex-col gap-6">
            {copy.howItWorks.steps.map((item, i) => {
              const styleMap = [
                { iconBg: "bg-emerald-100", iconColor: "text-emerald-700", pillBg: "bg-emerald-600" },
                { iconBg: "bg-amber-100", iconColor: "text-amber-600", pillBg: "bg-amber-500" },
                { iconBg: "bg-emerald-100", iconColor: "text-emerald-600", pillBg: "bg-emerald-600" },
              ] as const;
              const style = styleMap[i] ?? styleMap[0];

              return (
                <ScrollReveal key={item.step} delayMs={i * 100} className="w-full">
                  <div className="relative group bg-linear-to-br from-white to-emerald-50 border border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5 h-full">
                    <div
                      className={`inline-flex items-center justify-center w-7 h-7 ${style.pillBg} text-white text-xs font-black rounded-full mb-5`}
                    >
                      {item.step}
                    </div>
                    <div
                      className={`w-16 h-16 ${style.iconBg} ${style.iconColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {i === 0 && <TelegramIcon className="w-7 h-7" />}
                      {i === 1 && <CameraIcon className="w-7 h-7" />}
                      {i === 2 && <DocumentTextIcon className="w-7 h-7" />}
                    </div>
                    <h3 className="text-xl font-black text-emerald-950 mb-3">{item.title}</h3>
                    <p className="text-emerald-800/70 leading-relaxed text-sm">{item.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
