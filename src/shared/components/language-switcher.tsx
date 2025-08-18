'use client';
import { useEffect, useState } from 'react';
import { parseCookies, setCookie } from 'nookies';

const COOKIE_NAME = 'googtrans';

interface LanguageDescriptor {
  name: string;
  title: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __GOOGLE_TRANSLATION_CONFIG__: {
    languages: LanguageDescriptor[];
    defaultLanguage: string;
  } | undefined;
}

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string>();
  const [languageConfig, setLanguageConfig] = useState<any>();

  useEffect(() => {
    const cookies = parseCookies();
    const existingLanguageCookieValue = cookies[COOKIE_NAME];
    let languageValue: string | undefined;

    if (existingLanguageCookieValue) {
      const sp = existingLanguageCookieValue.split('/');
      if (sp.length > 2) {
        languageValue = sp[2];
      }
    }

    if (global.__GOOGLE_TRANSLATION_CONFIG__ && !languageValue) {
      languageValue = global.__GOOGLE_TRANSLATION_CONFIG__.defaultLanguage;
    }

    if (languageValue) {
      setCurrentLanguage(languageValue);
    }

    if (global.__GOOGLE_TRANSLATION_CONFIG__) {
      setLanguageConfig(global.__GOOGLE_TRANSLATION_CONFIG__);
    }
  }, []);

  if (!currentLanguage || !languageConfig) {
    return null;
  }

  const switchLanguage = (lang: string) => () => {
    setCookie(null, COOKIE_NAME, '/auto/' + lang);
    window.location.reload();
  };

  return (
    <div className="text-center notranslate text-xs md:text-sm">
      {languageConfig.languages.map((ld: LanguageDescriptor) => (
        <span key={ld.name}>
          {currentLanguage === ld.name ? (
            <span className="mx-1 md:mx-3 font-bold">{ld.title}</span>
          ) : (
            <button
              onClick={switchLanguage(ld.name)}
              className="mx-1 md:mx-3 text-blue-400 hover:text-blue-300 cursor-pointer hover:underline"
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
