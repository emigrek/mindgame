import i18n from "i18n";
import { join } from "path";

import localeList from "./localeList";

i18n.configure({
    locales: localeList,
    directory: join(__dirname, "..", "translations"),
    defaultLocale: "en-US",
    objectNotation: true
});

export default i18n;