"use client";

import type { Lang } from "@/lib/i18n";

export function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={() => setLang(lang === "th" ? "en" : "th")}
    >
      {lang === "th" ? "EN" : "TH"}
    </button>
  );
}
