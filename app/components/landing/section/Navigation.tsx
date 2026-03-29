import { brand } from "@/app/lib/brand";
import { TelegramIcon } from "../icons";
import { useLandingI18n } from "../i18n";

type NavigationProps = {
  scrolled: boolean;
};

export function Navigation({ scrolled }: NavigationProps) {
  const { locale, setLocale, copy } = useLandingI18n();

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/92 backdrop-blur-xl border-b border-emerald-100 shadow-[0_6px_30px_rgba(6,78,59,0.08)]"
          : "bg-white/60 backdrop-blur-md border-b border-white/30"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-black text-emerald-900 text-lg leading-none tracking-tight">{brand.projectName}</p>
            <p className="text-[11px] text-emerald-700/90 font-medium leading-none mt-0.5">{brand.tagline}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {copy.navigation.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-sm font-semibold text-emerald-900/85 hover:text-emerald-700 transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-emerald-600 after:transition-all hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center p-1 rounded-full bg-white/80 border border-emerald-100">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                locale === "en" ? "bg-emerald-700 text-white" : "text-emerald-800 hover:bg-emerald-50"
              }`}
              aria-pressed={locale === "en"}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("km")}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                locale === "km" ? "bg-emerald-700 text-white" : "text-emerald-800 hover:bg-emerald-50"
              }`}
              aria-pressed={locale === "km"}
            >
              ខ្មែរ
            </button>
          </div>

          <a
            href="https://t.me/savecropbot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-emerald-900/15 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <TelegramIcon className="w-4 h-4 opacity-95" />
            {copy.navigation.openBot}
          </a>
        </div>
      </div>
    </nav>
  );
}
