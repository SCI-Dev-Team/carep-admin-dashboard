import Image from "next/image";
import {
  BoltIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  LeafIcon,
  TelegramIcon,
} from "../icons";
import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function HeroSection() {
  const { copy } = useLandingI18n();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background photo: vegetable farm field (Unsplash — Markus Spiske, free to use). */}
      <div className="absolute inset-0">
        <Image
          src="/hero/hero-farm-background.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
      </div>

      <div className="absolute inset-0 bg-linear-to-r from-emerald-950/72 via-emerald-900/55 to-emerald-900/35" />
      <div className="absolute inset-0 bg-black/15" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-24 grid lg:grid-cols-2 gap-10 sm:gap-12 items-center w-full">
        <ScrollReveal className="max-w-2xl order-1">

          <h1 className="text-3xl sm:text-5xl xl:text-[62px] font-black text-white leading-[1.06] sm:leading-[1.03] tracking-tight mb-4 sm:mb-5">
            {copy.hero.titleLine1}
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-emerald-700 via-emerald-500 to-lime-500">
              {copy.hero.titleLine2}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/90 leading-relaxed mb-7 sm:mb-10 max-w-xl">
            {copy.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-7 sm:mb-9">
            <a
              href="https://t.me/savecropbot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-emerald-700 hover:bg-emerald-600 text-white px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-base transition-all hover:-translate-y-0.5"
            >
              <TelegramIcon className="w-5 h-5" />
              {copy.hero.primaryCta}
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 text-emerald-900 hover:text-emerald-700 px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-semibold text-base transition-all border-2 border-white/60 hover:border-white bg-white/95"
            >
              {copy.hero.secondaryCta}
              <ChevronDownIcon className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />, label: copy.hero.trust.accuracy },
              { icon: <BoltIcon className="w-4 h-4 text-amber-500" />, label: copy.hero.trust.response },
              { icon: <LeafIcon className="w-4 h-4 text-emerald-600" />, label: copy.hero.trust.crops },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 bg-white/95 border border-white/70 text-emerald-900 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm"
              >
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal className="relative flex justify-center lg:justify-end order-2" delayMs={120}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[300px] h-[300px] bg-emerald-300/30 rounded-full blur-3xl" />
          </div>

          <div className="relative w-full max-w-[320px] sm:max-w-[360px]">
            <div className="absolute -inset-1 bg-linear-to-r from-emerald-400 via-emerald-500 to-lime-400 rounded-[2.2rem] blur-md opacity-30" />
            <div className="relative rounded-4xl border border-white/80 bg-white/95 backdrop-blur-xl shadow-2xl shadow-emerald-200/70 p-3.5 md:p-4">
              <div className="rounded-[1.6rem] overflow-hidden border border-emerald-100 bg-emerald-50">
                <Image
                  src="/hero/phoneImage.jpg"
                  alt="Telegram crop diagnosis example"
                  width={468}
                  height={820}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/80 animate-bounce">
        <span className="text-[10px] uppercase tracking-widest font-semibold">{copy.hero.scroll}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </div>
    </section>
  );
}
