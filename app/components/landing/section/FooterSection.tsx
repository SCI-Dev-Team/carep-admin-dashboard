import Image from "next/image";
import { brand } from "@/app/lib/brand";
import { TelegramIcon } from "../icons";
import { useLandingI18n } from "../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function FooterSection() {
  const { copy } = useLandingI18n();

  return (
    <footer className="bg-white text-emerald-900 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100">
                <Image
                  src={brand.logo}
                  alt={brand.projectName}
                  width={44}
                  height={44}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-black text-emerald-950">{brand.projectName}</span>
            </div>
            <p className="text-emerald-800/80 text-sm leading-relaxed max-w-xs">
              {brand.tagline}. {copy.footer.description}
            </p>
          </div>

          <div>
            <h5 className="text-emerald-950 font-bold text-sm mb-4">{copy.footer.productTitle}</h5>
            <ul className="space-y-2.5 text-sm text-emerald-800">
              {copy.footer.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-emerald-600 transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-emerald-950 font-bold text-sm mb-4">{copy.footer.contactTitle}</h5>
            <ul className="space-y-2.5 text-sm text-emerald-800">
              <li>
                <a href="mailto:support@carep.org" className="hover:text-emerald-600 transition-colors">
                  {copy.footer.supportEmail}
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/savecropbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                >
                  <TelegramIcon className="w-3.5 h-3.5" />
                  {copy.footer.botHandle}
                </a>
              </li>
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal className="border-t border-emerald-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-emerald-700" delayMs={100}>
          <p>&copy; {new Date().getFullYear()} {brand.projectName}. {copy.footer.copyright}</p>
          <a href="/dashboard" className="text-emerald-300 hover:text-emerald-500 transition-colors select-none" aria-hidden="true">·</a>
        </ScrollReveal>
      </div>
    </footer>
  );
}
