import { registerLocaleData } from "@angular/common";
import localeEn from "@angular/common/locales/en";
import localeEs from "@angular/common/locales/es";
import localePt from "@angular/common/locales/pt";
import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { App } from "./app/app";

/**
 * Registers Angular's CLDR locale data for every locale the app supports, under the exact locale
 * codes used by {@link TranslationService} (`en-US`, `pt-BR`, `es-ES`). This must happen before
 * bootstrap so the `number`/`date` pipes can format values for a non-default locale passed
 * explicitly at the call site (e.g. `| date:'medium':undefined:i18n.locale()`).
 */
registerLocaleData(localeEn, "en-US");
registerLocaleData(localePt, "pt-BR");
registerLocaleData(localeEs, "es-ES");

/** Application entry point: bootstraps the standalone {@link App} root component. */
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
