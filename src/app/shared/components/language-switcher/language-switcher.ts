import { Component, inject } from "@angular/core";
import { Locale } from "../../../core/models/i18n.model";
import { TranslationService } from "../../../core/services/translation.service";
import { TranslatePipe } from "../../pipes/translate.pipe";

@Component({
    selector: "app-language-switcher",
    imports: [TranslatePipe],
    templateUrl: "./language-switcher.html",
    styleUrl: "./language-switcher.scss",
})
export class LanguageSwitcher {
    protected readonly i18n = inject(TranslationService);

    /**
     * Switches the application's active locale to the selected value.
     *
     * @param value the selected locale code, e.g. `pt-BR`
     */
    protected onChange(value: string): void {
        this.i18n.setLocale(value as Locale);
    }
}
