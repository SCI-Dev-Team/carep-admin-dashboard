import { ArrowRightIcon, CameraIcon, DocumentTextIcon, TelegramIcon } from "../icons";
import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function HowItWorksSection() {
  const { copy } = useLandingI18n();

  return (
    <section id="how-it-works" className="scroll-mt-28 py-28 px-6 bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-20">
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

        <ScrollReveal className="mb-14">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-[28px] p-px bg-linear-to-r from-emerald-200 via-emerald-100 to-lime-100 shadow-xl shadow-emerald-100/50">
              <div className="rounded-[27px] overflow-hidden bg-white border border-emerald-100/80">          
                <video
                  className="w-full h-auto bg-black"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  aria-label="How to use Save Crop"
                >
                  <source src="/video/howToUse.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {copy.howItWorks.steps.map((item, i) => {
            const styleMap = [
              { iconBg: "bg-emerald-100", iconColor: "text-emerald-700", pillBg: "bg-emerald-600" },
              { iconBg: "bg-amber-100", iconColor: "text-amber-600", pillBg: "bg-amber-500" },
              { iconBg: "bg-emerald-100", iconColor: "text-emerald-600", pillBg: "bg-emerald-600" },
            ] as const;
            const style = styleMap[i] ?? styleMap[0];

            return (
            <ScrollReveal key={item.step} delayMs={i * 120}>
              <div
              className="relative group bg-linear-to-br from-white to-emerald-50 border border-emerald-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`inline-flex items-center justify-center w-7 h-7 ${style.pillBg} text-white text-xs font-black rounded-full mb-6`}
              >
                {item.step}
              </div>
              <div
                className={`w-16 h-16 ${style.iconBg} ${style.iconColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {i === 0 && <TelegramIcon className="w-7 h-7" />}
                {i === 1 && <CameraIcon className="w-7 h-7" />}
                {i === 2 && <DocumentTextIcon className="w-7 h-7" />}
              </div>
              <h3 className="text-xl font-black text-emerald-950 mb-3">{item.title}</h3>
              <p className="text-emerald-800/70 leading-relaxed text-sm">{item.description}</p>
              {i < 2 && (
                <div className="hidden md:block absolute top-16 -right-5 z-10 text-emerald-300">
                  <ArrowRightIcon className="w-6 h-6" />
                </div>
              )}
              </div>
            </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
