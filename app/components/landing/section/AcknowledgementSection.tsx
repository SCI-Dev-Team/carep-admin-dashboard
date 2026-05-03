import Image from "next/image";
import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function AcknowledgementSection() {
  const { copy } = useLandingI18n();

  return (
    <section
      className="border-t border-emerald-100 bg-white px-6 py-12 sm:py-14"
      aria-labelledby="acknowledgement-heading"
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-10">
            <div className="flex w-full shrink-0 justify-center sm:w-26 sm:pt-1">
              <Image
                src="/logo/mfat_logo.jpg"
                alt={copy.footer.mfatLogoAlt}
                width={400}
                height={120}
                className="h-28 w-auto max-w-full object-contain object-center opacity-95"
              />
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h2
                id="acknowledgement-heading"
                className="text-base font-semibold tracking-tight text-emerald-950 sm:text-[1.05rem]"
              >
                {copy.footer.acknowledgementTitle}
              </h2>
              <div className="mt-4 space-y-4 text-pretty text-sm leading-[1.7] text-emerald-800/90">
                <p>{copy.footer.acknowledgementParagraph1}</p>
                <p>{copy.footer.acknowledgementParagraph2}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
