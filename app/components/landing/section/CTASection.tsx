import Image from "next/image";
import { brand } from "@/app/lib/brand";
import { TelegramIcon } from "../icons";
import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function CTASection() {
  const { copy } = useLandingI18n();

  return (
    <section className="relative py-28 px-6 overflow-hidden bg-linear-to-br from-emerald-700 via-emerald-600 to-lime-600">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
      </div>

      <div className="absolute right-16 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block pointer-events-none">
        <Image
          src={brand.logo}
          alt=""
          width={380}
          height={380}
          className="object-contain"
          aria-hidden="true"
        />
      </div>

      <ScrollReveal className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
          {copy.cta.titleLine1}
          <br />
          {copy.cta.titleLine2}
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-xl mx-auto leading-relaxed">
          {copy.cta.description}
        </p>
        <a
          href="https://t.me/savecropbot"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-white text-emerald-700 hover:bg-emerald-50 px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-emerald-900/20 hover:-translate-y-1"
        >
          <TelegramIcon className="w-6 h-6" />
          {copy.cta.button}
        </a>
        <p className="text-white/70 text-sm mt-5">
          {copy.cta.note}
        </p>
      </ScrollReveal>
    </section>
  );
}
