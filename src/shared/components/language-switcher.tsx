"use client";
import { useEffect, useState } from "react";
import { parseCookies, setCookie } from "nookies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const COOKIE_NAME = "googtrans";
const COOKIE_PATH = "/";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

interface LanguageDescriptor {
  name: string;
  title: string;
  flag?: string;
}

declare global {
  var __GOOGLE_TRANSLATION_CONFIG__:
    | { languages: LanguageDescriptor[]; defaultLanguage: string }
    | undefined;
}

const getLangFromCookie = (val?: string): string | undefined => {
  if (!val) return undefined;
  const sp = val.split("/");
  return sp.length > 2 ? sp[2] : undefined;
};

// ...existing code...

const getDomainVariants = (): string[] => {
  if (typeof window === "undefined") return [];
  const host = window.location.hostname;
  if (!host) return [];
  // don't return domain variants for localhost or IP addresses
  if (host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return [host];

  const withoutWww = host.replace(/^www\./, "");
  const parts = withoutWww.split(".");

  // base is the domain without the first label (example.com from sub.example.com)
  const base = parts.length > 1 ? parts.slice(1).join(".") : withoutWww;

  const variants = new Set<string>();
  // exact host (no domain attribute)
  variants.add(host);
  // dot-prefixed host (sometimes used in existing cookies)
  variants.add(`.${host}`);
  // base domain (example.com)
  variants.add(base);
  // dot-prefixed base domain (.example.com)
  variants.add(`.${base}`);

  return Array.from(variants);
};

const isDebugMode = (): boolean => {
  try {
    if (typeof window === "undefined") return false;
    return (
      new URLSearchParams(window.location.search).get("gtranslate_debug") ===
      "1"
    );
  } catch {
    return false;
  }
};

const startCookieMonitor = (
  label = "gtranslate-monitor",
  duration = 5000,
  interval = 200
) => {
  if (typeof window === "undefined" || !isDebugMode()) return;
  try {
    const start = Date.now();
    let last = document.cookie;
    console.info(`[${label}] start cookie monitor`, {
      now: new Date().toISOString(),
      cookie: last,
    });
    const id = setInterval(() => {
      const cur = document.cookie;
      if (cur !== last) {
        console.info(`[${label}] cookie changed`, {
          at: new Date().toISOString(),
          previous: last,
          current: cur,
        });
        last = cur;
      }
      if (Date.now() - start > duration) {
        clearInterval(id);
        console.info(`[${label}] cookie monitor ended`);
      }
    }, interval);
  } catch (e) {
    console.warn("gtranslate monitor failed", e);
  }
};

const applyCookie = (lang: string) => {
  const variants = getDomainVariants();
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:";

  // Use SameSite=None when secure to be cross-site friendly; fallback to Lax for insecure contexts.
  const sameSiteVal = secure ? "None" : "Lax";

  // Value format expected by Google Translate: '/source/target' or '/auto/target'
  const cookieValue = `/auto/${lang}`;

  // Try to set cookie via nookies + document.cookie for each likely domain variant.
  // Ensure production-specific variants are covered aggressively for kenesis hosts
  const prodSpecific = [];
  try {
    if (
      typeof window !== "undefined" &&
      window.location.hostname.endsWith("kenesis.io")
    ) {
      prodSpecific.push(
        "kenesis-frontend.kenesis.io",
        ".kenesis-frontend.kenesis.io",
        "kenesis.io",
        ".kenesis.io"
      );
    }
  } catch {
    /* ignore */
  }

  const allVariants = Array.from(new Set([...variants, ...prodSpecific]));

  allVariants.forEach((d) => {
    const opts: Record<string, string | number | boolean> = {
      path: COOKIE_PATH,
      maxAge: COOKIE_MAX_AGE,
      sameSite: sameSiteVal,
    };
    // If the variant looks like a domain (starts with a dot or contains a dot), set domain opt.
    if (d.includes(".")) opts.domain = d;
    if (secure) opts.secure = true;

    try {
      // nookies may throw if domain is not allowed; guard each call
      setCookie(null, COOKIE_NAME, cookieValue, opts);
    } catch {
      /* ignore */
    }

    // Also write a conservative document.cookie (best-effort).
    try {
      let cookieStr = `${COOKIE_NAME}=${encodeURIComponent(
        cookieValue
      )}; path=${COOKIE_PATH}; max-age=${COOKIE_MAX_AGE}; SameSite=${sameSiteVal}`;
      // Only set domain attribute when variant is not the exact host (document.cookie will ignore invalid domains)
      if (d.startsWith(".")) cookieStr += `; domain=${d}`;
      if (secure) cookieStr += `; Secure`;
      document.cookie = cookieStr;
      if (isDebugMode()) {
        try {
          console.info("[gtranslate-apply] wrote cookie string:", cookieStr);
          console.info("[gtranslate-apply] document.cookie after write:", document.cookie);
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
  });

  // Best-effort: try to remove conflicting googtrans cookies scoped differently by expiring
  // the cookie on the most common variants we can influence. This may not clear cookies
  // set by other domains outside our scope, but will help consolidate where possible.
  try {
    const toExpire = allVariants;
    toExpire.forEach((d) => {
      try {
        let expire = `${COOKIE_NAME}=; path=${COOKIE_PATH}; max-age=0`;
        if (d.startsWith(".")) expire += `; domain=${d}`;
        if (secure) expire += `; Secure`;
        document.cookie = expire;
      } catch {
        /* ignore */
      }
    });
  } catch {
    /* ignore */
  }

  // If debug mode is on, monitor cookies for a few seconds to catch who overwrites them.
  if (isDebugMode()) startCookieMonitor("gtranslate-apply", 7000, 250);
};

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  const [languages, setLanguages] = useState<LanguageDescriptor[]>([]);

  // Initialize from cookie or config once
  useEffect(() => {
    const cookies = parseCookies();
    const cookieLang = getLangFromCookie(cookies[COOKIE_NAME]);
    if (global.__GOOGLE_TRANSLATION_CONFIG__) {
      setLanguages(global.__GOOGLE_TRANSLATION_CONFIG__.languages);
      const initial =
        cookieLang || global.__GOOGLE_TRANSLATION_CONFIG__.defaultLanguage;
      setCurrentLanguage(initial);
      // If no cookie present, initialize it
      if (!cookieLang) applyCookie(initial);

      // If a preferred language was stored (from a previous selection), ensure
      // the cookie matches it. This handles production cases where Google may
      // asynchronously overwrite the cookie after load.
      try {
        const stored =
          typeof window !== "undefined"
            ? window.localStorage.getItem("gtranslate_preferred_lang")
            : null;
        if (stored && stored !== cookieLang && stored !== initial) {
          // Re-apply cookie and force a reload to make the Google script pick it up.
          applyCookie(stored);
          // Remove the stored flag to avoid reload loops
          window.localStorage.removeItem("gtranslate_preferred_lang");
          setCurrentLanguage(stored);
          setTimeout(() => window.location.reload(), 150);
        }
      } catch {
        /* ignore localStorage errors */
      }
    }
  }, []);

  // Sync on visibility change (avoid constant polling) to catch external modifications
  useEffect(() => {
    const handler = () => {
      const cookies = parseCookies();
      const cookieLang = getLangFromCookie(cookies[COOKIE_NAME]);
      if (cookieLang && cookieLang !== currentLanguage)
        setCurrentLanguage(cookieLang);
    };
    document.addEventListener("visibilitychange", handler);
    const interval = setInterval(handler, 8000);
    return () => {
      document.removeEventListener("visibilitychange", handler);
      clearInterval(interval);
    };
  }, [currentLanguage]);

  const onChange = (value: string) => {
    if (value === currentLanguage) return;
    // Store desired language as a short-lived hint so init can re-apply it if
    // Google later overwrites the cookie on production.
    try {
      if (typeof window !== "undefined")
        window.localStorage.setItem("gtranslate_preferred_lang", value);
    } catch {
      /* ignore */
    }
    applyCookie(value);
    setCurrentLanguage(value);
    // Give the cookie a moment to propagate (helps on some CDN / proxy / production setups)
    setTimeout(() => window.location.reload(), 150);
  };

  if (!languages.length) return null;

  const current = languages.find((l) => l.name === currentLanguage);

  return (
    <div className="notranslate w-32">
      <Select value={currentLanguage} onValueChange={onChange}>
        <SelectTrigger className="h-8 bg-white/5 border-white/20 text-white text-xs [&>span]:flex [&>span]:items-center [&>span]:gap-1 pr-2">
          {/* Custom value rendering with flag */}
          <span>
            {current?.flag} {current?.title}
          </span>
        </SelectTrigger>
        <SelectContent className="bg-[#0F0B24] text-white border border-white/10">
          {languages.map((l) => (
            <SelectItem
              key={l.name}
              value={l.name}
              className="text-xs flex items-center gap-2"
            >
              <span className="mr-1">{l.flag}</span>
              {l.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { LanguageSwitcher };
