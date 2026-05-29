"use client";

import { useLanguage } from "./language-provider";

export function LanguageToggle() {
  const { locale, setLocale, text } = useLanguage();

  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-navy">
      <span>{text("language")}</span>
      <select
        className="rounded-full border border-navy/20 bg-white px-3 py-2 text-sm shadow-sm"
        value={locale}
        onChange={(event) => setLocale(event.target.value === "ta" ? "ta" : "en")}
      >
        <option value="en">EN</option>
        <option value="ta">தமிழ்</option>
      </select>
    </label>
  );
}
