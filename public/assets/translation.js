function TranslateInit() {
  if (!window.__GOOGLE_TRANSLATION_CONFIG__) {
    return;
  }
  new google.translate.TranslateElement({
    pageLanguage: window.__GOOGLE_TRANSLATION_CONFIG__.defaultLanguage,
    includedLanguages: window.__GOOGLE_TRANSLATION_CONFIG__.languages
      .map((l) => l.name)
      .join(","),
  });
}
