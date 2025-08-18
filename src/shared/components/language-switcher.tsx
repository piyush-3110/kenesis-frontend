"use client";
import { useEffect, useState } from "react";
import { parseCookies, setCookie } from "nookies";

const COOKIE_NAME = "googtrans";

interface LanguageDescriptor {
  name: string;
  title: string;
}

declare global {
  interface Window {
    __GOOGLE_TRANSLATION_CONFIG__: {
      languages: LanguageDescriptor[];
      defaultLanguage: string;
    };
  }
}

const DOMAIN = ".kenesis.io"; // Set cookie available across all subdomains

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string>();
  const [languageConfig, setLanguageConfig] = useState<any>();

  useEffect(() => {
    const cookies = parseCookies();
    const existingLanguageCookieValue = cookies[COOKIE_NAME];
    let languageValue;

    if (existingLanguageCookieValue) {
      const sp = existingLanguageCookieValue.split("/");
      if (sp.length > 2) {
        languageValue = sp[2];
      }
    }
    if (window.__GOOGLE_TRANSLATION_CONFIG__ && !languageValue) {
      languageValue = window.__GOOGLE_TRANSLATION_CONFIG__.defaultLanguage;
    }
    if (languageValue) {
      setCurrentLanguage(languageValue);
    }
    if (window.__GOOGLE_TRANSLATION_CONFIG__) {
      setLanguageConfig(window.__GOOGLE_TRANSLATION_CONFIG__);
    }
  }, []);

  if (!currentLanguage || !languageConfig) {
    return null;
  }

  const switchLanguage = (lang: string) => () => {
    setCookie(null, "googtrans", `/auto/${lang}`, {
      path: "/",
      domain: DOMAIN,
    });

    // Remove Google Translate script and widget
    document.getElementById("google_translate_element")?.remove();
    const gtScripts = Array.from(document.querySelectorAll("script")).filter(
      (s) => s.src.includes("translate_a/element.js")
    );
    gtScripts.forEach((s) => s.remove());

    // Add a timeout to ensure DOM is clean, then reload
    setTimeout(() => {
      // Optionally, force full reload for safety:
      window.location.reload();

      // If you want to avoid reload (SPAs), you would need to:
      // 1. Add back <div id="google_translate_element" />
      // 2. Re-add the script:
      // const script = document.createElement('script');
      // script.src = '//translate.google.com/translate_a/element.js?cb=TranslateInit';
      // document.body.appendChild(script);
      // NOTE: Reload is simplest and most bulletproof!
    }, 200);
  };

  return (
    <div className="text-center notranslate">
      {languageConfig.languages.map((ld: LanguageDescriptor) => (
        <span key={ld.name}>
          {currentLanguage === ld.name ? (
            <span className="mx-3 font-bold">{ld.title}</span>
          ) : (
            <button
              onClick={switchLanguage(ld.name)}
              className="mx-3 text-blue-600 cursor-pointer hover:underline"
            >
              {ld.title}
            </button>
          )}
        </span>
      ))}
    </div>
  );
};

export { LanguageSwitcher };
