import alt from "alt-instance";
import IntlActions from "actions/IntlActions";
import SettingsActions from "actions/SettingsActions";
import counterpart from "counterpart";
var locale_ru = require("assets/locales/locale-ru.json");
var locale_en = require("assets/locales/locale-en.json");
var locale_zh = require("assets/locales/locale-zh.json");
var locale_vi = require("assets/locales/locale-vi.json");
var locale_de = require("assets/locales/locale-de.json");
var locale_tr = require("assets/locales/locale-tr.json");
import ls from "common/localStorage";
let ss = new ls("__graphene__");

counterpart.registerTranslations("ru", locale_ru);
counterpart.registerTranslations("en", locale_en);
counterpart.registerTranslations("zh", locale_zh);
counterpart.registerTranslations("vi", locale_vi);
counterpart.registerTranslations("de", locale_de);
counterpart.registerTranslations("tr", locale_tr);
counterpart.setFallbackLocale("en");

import {addLocaleData} from "react-intl";

import localeCodes from "assets/locales";
for (let localeCode of localeCodes) {
    addLocaleData(require(`react-intl/locale-data/${localeCode}`));
}

class IntlStore {
    constructor() {
        const storedSettings = ss.get("settings_v4", {});
        // storedSettings.locale = "en"; // set here for test
        // console.log("storedSettings", storedSettings);
        if (storedSettings.locale === undefined) {
            storedSettings.locale = "en";
        }
        this.currentLocale = storedSettings.locale;

        this.locales = ["ru", "en", "zh", "vi", "de", "tr"];
        this.localesObject = {
            ru: locale_ru,
            en: locale_en,
            zh: locale_zh,
            vi: locale_vi,
            de: locale_de,
            tr: locale_tr
        };

        this.bindListeners({
            onSwitchLocale: IntlActions.switchLocale,
            onGetLocale: IntlActions.getLocale,
            onClearSettings: SettingsActions.clearSettings
        });
    }

    hasLocale(locale) {
        return this.locales.indexOf(locale) !== -1;
    }

    getCurrentLocale() {
        return this.currentLocale;
    }

    onSwitchLocale({locale, localeData}) {
        switch (locale) {
            case "en":
                counterpart.registerTranslations("en", this.localesObject.en);
                break;

            case "ru":
                counterpart.registerTranslations("ru", this.localesObject.ru);
                break;

            case "zh":
                counterpart.registerTranslations("zh", this.localesObject.zh);
                break;

            case "vi":
                counterpart.registerTranslations("vi", this.localesObject.vi);
                break;

            case "de":
                counterpart.registerTranslations("de", this.localesObject.de);
                break;

            case "tr":
                counterpart.registerTranslations("tr", this.localesObject.tr);
                break;

            default:
                counterpart.registerTranslations(locale, localeData);
                break;
        }

        counterpart.setLocale(locale);
        this.currentLocale = locale;
    }

    onGetLocale(locale) {
        if (this.locales.indexOf(locale) === -1) {
            this.locales.push(locale);
        }
    }

    onClearSettings() {
        this.onSwitchLocale({locale: "en"});
    }
}

export default alt.createStore(IntlStore, "IntlStore");
