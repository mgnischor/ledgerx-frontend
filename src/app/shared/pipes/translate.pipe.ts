import { Pipe, PipeTransform, inject } from "@angular/core";
import { TranslationService } from "../../core/services/translation.service";

/**
 * Marked impure so every interpolation re-evaluates when the active locale (and therefore the
 * loaded translation tree) changes, regardless of the host component's change-detection strategy.
 */
@Pipe({ name: "translate", pure: false })
export class TranslatePipe implements PipeTransform {
    private readonly translation = inject(TranslationService);

    /**
     * Resolves a translation key (with optional interpolation params) against the active locale.
     *
     * @param key    the dot-notation translation key, or a falsy value for an empty result
     * @param params optional interpolation values for `{{ ... }}` placeholders
     * @returns the translated string, or an empty string when `key` is falsy
     */
    transform(key: string | null | undefined, params?: Record<string, string | number>): string {
        return key ? this.translation.t(key, params) : "";
    }
}
