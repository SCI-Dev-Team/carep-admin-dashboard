import Image from "next/image";
import { brand } from "@/app/lib/brand";
import { TelegramIcon } from "../icons";
import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function CTASection() {
  const { copy } = useLandingI18n();

  return (
    <section
      className="relative py-20 sm:py-24 lg:py-28 px-4 sm:px-6 overflow-hidden bg-emerald-950"
      aria-labelledby="cta-heading"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-600/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-lime-400/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(255 255 255) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="relative overflow-hidden   sm:px-12 sm:py-14 lg:px-16 lg:py-16">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 max-w-md " />

            <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(200px,280px)] lg:gap-16">
              <div className="text-center lg:text-left">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/90">
                  {brand.tagline}
                </p>
                <h2
                  id="cta-heading"
                  className="mb-5 text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
                >
                  {copy.cta.titleLine1}
                  <span className="mt-1 block bg-linear-to-r from-white via-emerald-50 to-lime-100 bg-clip-text text-transparent">
                    {copy.cta.titleLine2}
                  </span>
                </h2>
                <p className="mx-auto mb-8 text-white">
                  {copy.cta.description}
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                  <a
                    href="https://t.me/savecropbot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-emerald-950 shadow-lg shadow-black/15 transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                  >
                    <TelegramIcon className="h-5 w-5 shrink-0" aria-hidden />
                    {copy.cta.button}
                  </a>
                </div>
                <p className="mt-6 text-sm text-emerald-500/90">{copy.cta.note}</p>
              </div>

              <div className="relative mx-auto hidden h-44 w-44 justify-center sm:h-52 sm:w-52 lg:flex lg:mx-0 lg:h-full lg:max-h-72 lg:w-full">
                <div className="pointer-events-none relative aspect-square w-full max-w-[280px] opacity-[0.92]">
                  <Image
                    src={brand.logo}
                    alt=""
                    width={280}
                    height={280}
                    className="object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.35)]"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
