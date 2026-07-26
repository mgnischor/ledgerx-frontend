export type Locale = "en-US" | "pt-BR" | "es-ES";

export interface LocaleOption {
    code: Locale;
    label: string;
    flag: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
    { code: "en-US", label: "English", flag: "🇺🇸" },
    { code: "pt-BR", label: "Português", flag: "🇧🇷" },
    { code: "es-ES", label: "Español", flag: "🇪🇸" },
];

export const DEFAULT_LOCALE: Locale = "en-US";
