import { AsyncLocalStorage } from "node:async_hooks";
import i18n from "i18n";
import { join } from "path";

import localeList from "./localeList";

i18n.configure({
    locales: localeList,
    directory: join(__dirname, "..", "translations"),
    defaultLocale: "en-US",
    objectNotation: true,
    // Defaults would write missing keys into src/translations at runtime and show raw keys to Polish users
    updateFiles: false,
    retryInDefaultLocale: true
});

// The i18n package keeps one global locale, so setLocale() in one event used to switch the language of every
// other event awaiting at that moment. Each event now runs in its own scope (see ExtendedClient.loadEvents).
const localeScope = new AsyncLocalStorage<{ locale: string }>();

// Discord locales without a translation (e.g. en-GB) fall back to the default
const supportedLocale = (locale?: string | null) => locale && localeList.includes(locale) ? locale : "en-US";
// Outside a scope (startup, command definitions at import time) the default applies
const currentLocale = () => localeScope.getStore()?.locale ?? "en-US";
const withLocale = (phrase: string | i18n.TranslateOptions): i18n.TranslateOptions =>
    typeof phrase === "string" ? { phrase, locale: currentLocale() } : phrase;

export const runInLocaleScope = <T>(run: () => T): T => localeScope.run({ locale: "en-US" }, run);

export default {
    // Applies to the rest of the current event only
    setLocale: (locale?: string | null) => {
        const scope = localeScope.getStore();
        if (scope) scope.locale = supportedLocale(locale);
    },
    __: (phrase: string | i18n.TranslateOptions) => i18n.__(withLocale(phrase)),
    __mf: (phrase: string | i18n.TranslateOptions, replacements: object = {}) =>
        i18n.__mf(withLocale(phrase), replacements),
    __n: (phrase: string, count: number) => i18n.__n({ singular: phrase, plural: phrase, locale: currentLocale() }, count),
};
