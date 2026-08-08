import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { DEFAULT_LOCALE, Locale, SUPPORTED_LOCALES } from "../models/i18n.model";

type TranslationTree = { [key: string]: string | TranslationTree };

const STORAGE_KEY = "ledgerx.locale";

@Injectable({ providedIn: "root" })
export class TranslationService {
    private readonly http = inject(HttpClient);

    private readonly translations = signal<TranslationTree>({});

    readonly locale = signal<Locale>(this.resolveInitialLocale());
    readonly locales = SUPPORTED_LOCALES;

    /** Fetches the active locale's translation tree. Awaited once at bootstrap via an app initializer. */
    async load(): Promise<void> {
        const tree = await firstValueFrom(this.http.get<TranslationTree>(`/i18n/${this.locale()}.json`));
        this.translations.set(tree);
        document.documentElement.lang = this.locale();
    }

    /**
     * Switches the active locale, persisting the choice and reloading that locale's translations.
     *
     * @param locale the locale to switch to; a no-op when it is already the active locale
     */
    async setLocale(locale: Locale): Promise<void> {
        if (locale === this.locale()) {
            return;
        }
        this.locale.set(locale);
        localStorage.setItem(STORAGE_KEY, locale);
        await this.load();
    }

    /** Dot-notation lookup, e.g. `t("nav.dashboard")`. Falls back to the key itself when missing. */
    t(key: string, params?: Record<string, string | number>): string {
        const template = this.lookup(key);
        if (template === undefined) {
            return key;
        }
        return params ? this.interpolate(template, params) : template;
    }

    /**
     * Resolves a dot-notation key against the loaded translation tree.
     *
     * @param key the dot-notation key to resolve, e.g. `nav.dashboard`
     * @returns the resolved string value, or `undefined` when the key is absent
     */
    private lookup(key: string): string | undefined {
        let node: string | TranslationTree | undefined = this.translations();
        for (const segment of key.split(".")) {
            if (typeof node !== "object" || node === null) {
                return undefined;
            }
            node = node[segment];
        }
        return typeof node === "string" ? node : undefined;
    }

    /**
     * Replaces every `{{ paramName }}` placeholder in a template with the matching parameter.
     *
     * @param template the template string containing `{{ ... }}` placeholders
     * @param params   the interpolation values, keyed by placeholder name
     * @returns the template with known placeholders substituted; unknown ones are left untouched
     */
    private interpolate(template: string, params: Record<string, string | number>): string {
        return template.replace(/{{\s*(\w+)\s*}}/g, (match, name: string) =>
            Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
        );
    }

    /**
     * Chooses the locale to use on first load: a stored preference, then an exact browser-language
     * match, then a loose language-only match, and finally {@link DEFAULT_LOCALE}.
     *
     * @returns the resolved initial locale code
     */
    private resolveInitialLocale(): Locale {
        const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
        if (stored && SUPPORTED_LOCALES.some((option) => option.code === stored)) {
            return stored;
        }

        const browserLanguage = navigator.language;
        const exactMatch = SUPPORTED_LOCALES.find((option) => option.code === browserLanguage);
        if (exactMatch) {
            return exactMatch.code;
        }

        const languageOnly = browserLanguage.split("-")[0];
        const looseMatch = SUPPORTED_LOCALES.find((option) => option.code.startsWith(`${languageOnly}-`));
        return looseMatch?.code ?? DEFAULT_LOCALE;
    }
}
