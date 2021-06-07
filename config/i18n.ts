export default {
  locales: [
    { code: "en", iso: "en-US", file: "en.js" },
    { code: "nl", iso: "nl-NL", file: "nl.js" },
  ],
  defaultLocale: "en",
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: "i18n_redirected",
    onlyOnRoot: true,
  },
  langDir: "~/lang/",
  vueI18nLoader: true,
  vueI18n: {
    fallbackLocale: "en",
  }
};
