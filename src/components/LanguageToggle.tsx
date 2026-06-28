import { Language } from "../utils/translations";

interface LanguageToggleProps {
  lang: Language;
  onChange: (lang: Language) => void;
  className?: string;
}

export default function LanguageToggle({ lang, onChange, className = "" }: LanguageToggleProps) {
  const toggle = () => {
    const nextLang = lang === "en" ? "ar" : "en";
    onChange(nextLang);
  };

  return (
    <button
      onClick={toggle}
      id="lang-toggle-btn"
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer
        ${className} 
        bg-zinc-900 border-zinc-800 text-amber-500 hover:border-amber-500 hover:bg-zinc-850`}
    >
      {lang === "en" ? "العربية (RTL)" : "English (LTR)"}
    </button>
  );
}
