"use client";
import Script from "next/script";
import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
];

export function Translator() {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const match = document.cookie.match(/googtrans=([^;]+)/);
    if (match) {
      const langCode = match[1].split("/")[2];
      if (langCode) setCurrentLang(langCode);
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = `googtrans=/en/${langCode}; expires=${date.toUTCString()}; path=/`;
    
    setCurrentLang(langCode);
    setOpen(false);
    window.location.reload();
  };

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `,
        }}
      />

      <div id="google_translate_element" className="hidden"></div>

      {/* Inline Navbar Dropdown */}
      <div className="relative" ref={ref}>
        <button 
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-primary-foreground/80 hover:bg-primary-foreground/10 transition-colors"
          aria-label="Translate"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:block">{currentLanguage.code.toUpperCase()}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-xl shadow-xl w-48 max-h-80 overflow-y-auto z-50">
            <div className="p-2">
              <div className="space-y-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      {lang.name}
                    </span>
                    {currentLang === lang.code && <Check className="h-4 w-4 text-accent" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}