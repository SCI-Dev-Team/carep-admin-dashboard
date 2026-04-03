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
      className={`fixed top-0 w-full z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? "bg-white/92 backdrop-blur-xl border-b border-emerald-100 shadow-[0_6px_30px_rgba(6,78,59,0.08)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <p
              className={`font-black text-base sm:text-lg leading-none tracking-tight transition-colors ${
                scrolled ? "text-emerald-900" : "text-white drop-shadow-sm"
              }`}
            >
              {brand.projectName}
            </p>
            <p
              className={`hidden sm:block text-[11px] font-medium leading-none mt-0.5 transition-colors ${
                scrolled ? "text-emerald-700/90" : "text-white/85 drop-shadow-sm"
              }`}
            >
              {brand.tagline}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {copy.navigation.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`relative text-sm font-semibold transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:transition-all hover:after:w-full ${
                scrolled
                  ? "text-emerald-900/85 hover:text-emerald-700 after:bg-emerald-600"
                  : "text-white/90 hover:text-white after:bg-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center p-1 rounded-full border transition-colors ${
              scrolled
                ? "bg-white/80 border-emerald-100"
                : "bg-white/15 border-white/25 backdrop-blur-md"
            }`}
          >
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                locale === "en"
                  ? scrolled
                    ? "bg-emerald-700 text-white"
                    : "bg-white text-emerald-800"
                  : scrolled
                    ? "text-emerald-800 hover:bg-emerald-50"
                    : "text-white/90 hover:bg-white/10"
              }`}
              aria-pressed={locale === "en"}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("km")}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                locale === "km"
                  ? scrolled
                    ? "bg-emerald-700 text-white"
                    : "bg-white text-emerald-800"
                  : scrolled
                    ? "text-emerald-800 hover:bg-emerald-50"
                    : "text-white/90 hover:bg-white/10"
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
            className="hidden sm:inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-emerald-900/15 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <TelegramIcon className="w-4 h-4 opacity-95" />
            {copy.navigation.openBot}
          </a>
        </div>
      </div>
    </nav>
  );
}
