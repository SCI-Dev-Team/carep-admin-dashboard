import Image from "next/image";
import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function OurStorySection() {
  const { copy } = useLandingI18n();

  return (
    <section id="our-story" className="scroll-mt-28 py-24 px-6 bg-[#f8fbf6]">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        <ScrollReveal>
          <div className="rounded-3xl overflow-hidden border border-emerald-100 shadow-lg shadow-emerald-100/50 bg-white">
            <Image
              src="/image_landingpage/ourStory.jpg"
              alt={copy.ourStory.imageAlt}
              width={1280}
              height={960}
              className="w-full h-auto object-cover"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={120}>
          <div>
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">
              {copy.ourStory.badge}
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-emerald-950 mb-5 tracking-tight">
              {copy.ourStory.title}
            </h2>
            <p className="text-emerald-800/80 leading-relaxed mb-4 text-base md:text-lg">
              {copy.ourStory.paragraphOne}
            </p>
            <p className="text-emerald-800/75 leading-relaxed text-base md:text-lg">
              {copy.ourStory.paragraphTwo}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
