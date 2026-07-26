import { Pipe, PipeTransform, inject } from "@angular/core";
import { TranslationService } from "../../core/services/translation.service";

/**
 * Marked impure so every interpolation re-evaluates when the active locale (and therefore the
 * loaded translation tree) changes, regardless of the host component's change-detection strategy.
 */
@Pipe({ name: "translate", pure: false })
export class TranslatePipe implements PipeTransform {
    private readonly translation = inject(TranslationService);

    transform(key: string | null | undefined, params?: Record<string, string | number>): string {
        return key ? this.translation.t(key, params) : "";
    }
}
