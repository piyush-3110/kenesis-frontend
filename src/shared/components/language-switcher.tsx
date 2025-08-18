'use client';
import { useEffect, useState } from 'react';
import { parseCookies, setCookie } from 'nookies';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

const COOKIE_NAME = 'googtrans';
const COOKIE_PATH = '/';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

interface LanguageDescriptor { name: string; title: string; flag?: string }

declare global { var __GOOGLE_TRANSLATION_CONFIG__: { languages: LanguageDescriptor[]; defaultLanguage: string; } | undefined; }

const getLangFromCookie = (val?: string): string | undefined => {
  if (!val) return undefined;
  const sp = val.split('/');
  return sp.length > 2 ? sp[2] : undefined;
};

const applyCookie = (lang: string) => {
  setCookie(null, COOKIE_NAME, `/auto/${lang}`, { path: COOKIE_PATH, maxAge: COOKIE_MAX_AGE });
};

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [languages, setLanguages] = useState<LanguageDescriptor[]>([]);

  // Initialize from cookie or config once
  useEffect(() => {
    const cookies = parseCookies();
    const cookieLang = getLangFromCookie(cookies[COOKIE_NAME]);
    if (global.__GOOGLE_TRANSLATION_CONFIG__) {
      setLanguages(global.__GOOGLE_TRANSLATION_CONFIG__.languages);
      const initial = cookieLang || global.__GOOGLE_TRANSLATION_CONFIG__.defaultLanguage;
      setCurrentLanguage(initial);
      if (!cookieLang) applyCookie(initial);
    }
  }, []);

  // Sync on visibility change (avoid constant polling) to catch external modifications
  useEffect(() => {
    const handler = () => {
      const cookies = parseCookies();
      const cookieLang = getLangFromCookie(cookies[COOKIE_NAME]);
      if (cookieLang && cookieLang !== currentLanguage) setCurrentLanguage(cookieLang);
    };
    document.addEventListener('visibilitychange', handler);
    const interval = setInterval(handler, 8000);
    return () => { document.removeEventListener('visibilitychange', handler); clearInterval(interval); };
  }, [currentLanguage]);

  const onChange = (value: string) => {
    if (value === currentLanguage) return;
    applyCookie(value);
    setCurrentLanguage(value);
    // Reload to let Google script re-evaluate cookie (simplest reliable approach here)
    location.reload();
  };

  if (!languages.length) return null;

  const current = languages.find(l => l.name === currentLanguage);

  return (
    <div className="notranslate w-32">
      <Select value={currentLanguage} onValueChange={onChange}>
        <SelectTrigger className="h-8 bg-white/5 border-white/20 text-white text-xs [&>span]:flex [&>span]:items-center [&>span]:gap-1 pr-2">
          {/* Custom value rendering with flag */}
          <span>{current?.flag} {current?.title}</span>
        </SelectTrigger>
        <SelectContent className="bg-[#0F0B24] text-white border border-white/10">
          {languages.map(l => (
            <SelectItem key={l.name} value={l.name} className="text-xs flex items-center gap-2">
              <span className="mr-1">{l.flag}</span>{l.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { LanguageSwitcher };
