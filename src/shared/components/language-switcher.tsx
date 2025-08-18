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
    // Set cookie for the root domain to support subdomain switching
    setCookie(null, COOKIE_NAME, `/auto/${lang}`, {
      path: "/",
      domain: DOMAIN,
    });
    setTimeout(() => {
      window.location.reload();
    }, 100); // small timeout ensures cookie is set before reload
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
