import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout as sleep } from "node:timers/promises";
import i18n, { runInLocaleScope } from "./i18n";

test("uses the default locale outside a scope and for untranslated locales", async () => {
    assert.equal(i18n.__("error.title"), "Error");
    await runInLocaleScope(async () => {
        i18n.setLocale("de");
        assert.equal(i18n.__("error.title"), "Error");
    });
});

test("concurrent scopes keep their own locale across awaits", async () => {
    const render = (locale: string, delay: number) => runInLocaleScope(async () => {
        i18n.setLocale(locale);
        await sleep(delay); // the other scope calls setLocale meanwhile
        return [i18n.__("error.title"), i18n.__mf("utils.levelRequirement", { level: 5 }), i18n.__n("notifications.voiceStreakFormat", 5)];
    });

    const [polish, english] = await Promise.all([render("pl", 20), render("en-US", 5)]);
    assert.deepEqual(polish, ["Błąd", "Twój poziom jest zbyt niski.\nOsiągnij **Poziom 5** i spróbuj ponownie.", "5 dni"]);
    assert.deepEqual(english, ["Error", "Your level is too low.\nReach **Level 5** and try again.", "5 days"]);
});

test("explicit locales are passed through", () => {
    assert.equal(i18n.__({ phrase: "error.title", locale: "pl" }), "Błąd");
});
