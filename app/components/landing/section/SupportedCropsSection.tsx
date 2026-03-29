import Image from "next/image";
import { brassicaFamily, cucurbitFamily } from "../constants";
import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function SupportedCropsSection() {
  const { copy } = useLandingI18n();

  return (
    <section id="crops" className="scroll-mt-28 py-28 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">
            {copy.crops.badge}
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-emerald-950 mb-4 tracking-tight">
            {copy.crops.title}
          </h2>
          <p className="text-lg text-emerald-800/70 max-w-lg mx-auto">
            {copy.crops.description}
          </p>
        </ScrollReveal>

        <ScrollReveal className="mb-14">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-emerald-100 flex-1" />
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-black text-sm">1</span>
              </div>
              <h3 className="text-lg font-black text-emerald-950">
                {copy.crops.familyOneTitle}{" "}
                <span className="text-emerald-500 font-normal text-sm">{copy.crops.familyOneSubtitle}</span>
              </h3>
            </div>
            <div className="h-px bg-emerald-100 flex-1" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {cucurbitFamily.map((veg, i) => (
              <div
                key={veg.name}
                className="relative rounded-2xl overflow-hidden border border-emerald-100 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-md group cursor-default bg-white"
              >
                <div className="relative aspect-4/5">
                  <Image
                    src={veg.image}
                    alt={copy.crops.familyOneItems[i] ?? veg.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-emerald-950/75 via-emerald-900/20 to-transparent" />
                </div>
                <div className="absolute left-3 right-3 bottom-3">
                  <h4 className="font-bold text-xs sm:text-sm leading-snug text-white drop-shadow">
                    {copy.crops.familyOneItems[i] ?? veg.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={120}>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-emerald-100 flex-1" />
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-black text-sm">2</span>
              </div>
              <h3 className="text-lg font-black text-emerald-950">
                {copy.crops.familyTwoTitle}{" "}
                <span className="text-emerald-500 font-normal text-sm">{copy.crops.familyTwoSubtitle}</span>
              </h3>
            </div>
            <div className="h-px bg-emerald-100 flex-1" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {brassicaFamily.map((veg, i) => (
              <div
                key={veg.name}
                className="relative rounded-2xl overflow-hidden border border-emerald-100 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-md group cursor-default bg-white"
              >
                <div className="relative aspect-4/5">
                  <Image
                    src={veg.image}
                    alt={copy.crops.familyTwoItems[i] ?? veg.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-emerald-950/75 via-emerald-900/20 to-transparent" />
                </div>
                <div className="absolute left-3 right-3 bottom-3">
                  <h4 className="font-bold text-xs sm:text-sm leading-snug text-white drop-shadow">
                    {copy.crops.familyTwoItems[i] ?? veg.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
