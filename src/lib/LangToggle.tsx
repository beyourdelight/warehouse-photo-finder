"use client";

import type { Lang } from "@/lib/i18n";

export function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={lang === "en"}
      aria-label="Language"
      className="lang-switch"
      onClick={() => setLang(lang === "th" ? "en" : "th")}
    >
      <span className="lang-switch-label">TH</span>
      <span className="lang-switch-label">EN</span>
      <span className={`lang-switch-thumb ${lang === "en" ? "lang-switch-thumb-en" : ""}`}>
        {lang === "th" ? "TH" : "EN"}
      </span>
    </button>
  );
}
