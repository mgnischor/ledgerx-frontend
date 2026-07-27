/** A BCP 47 locale code supported by {@link TranslationService}. */
export type Locale = "en-US" | "pt-BR" | "es-ES";

/** Display metadata for one entry in the language switcher. */
export interface LocaleOption {
    code: Locale;
    /** Native-language display name shown in the language switcher, e.g. `Português`. */
    label: string;
    /** Emoji flag shown alongside {@link label}. */
    flag: string;
}

/** Every locale the application ships a translation file for, in display order. */
export const SUPPORTED_LOCALES: LocaleOption[] = [
    { code: "en-US", label: "English", flag: "🇺🇸" },
    { code: "pt-BR", label: "Português", flag: "🇧🇷" },
    { code: "es-ES", label: "Español", flag: "🇪🇸" },
];

/** Locale used when neither a stored preference nor the browser's language match a supported one. */
export const DEFAULT_LOCALE: Locale = "en-US";
