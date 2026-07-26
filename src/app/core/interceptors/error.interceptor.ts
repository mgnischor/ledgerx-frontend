import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { ApiError } from "../models/common.model";
import { AuthService } from "../services/auth.service";
import { ToastService } from "../services/toast.service";
import { TranslationService } from "../services/translation.service";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toast = inject(ToastService);
    const authService = inject(AuthService);
    const router = inject(Router);
    const i18n = inject(TranslationService);

    return next(req).pipe(
        catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse) {
                if (error.status === 401) {
                    authService.logout();
                    router.navigate(["/login"]);
                    toast.error(i18n.t("errors.sessionExpired"));
                } else {
                    toast.error(extractMessage(error, i18n));
                }
            }
            return throwError(() => error);
        }),
    );
};

function extractMessage(error: HttpErrorResponse, i18n: TranslationService): string {
    const body = error.error as ApiError | undefined;

    // body.message/body.details come straight from the backend and are not localized.
    if (body?.message) {
        return body.details?.length ? `${body.message} ${body.details.join(" ")}` : body.message;
    }
    if (body?.details?.length) {
        return body.details.join(" ");
    }
    if (body?.error) {
        // Spring Boot's default error body for uncaught 400s (e.g. @Valid failures) carries no
        // per-field detail, only the short reason phrase (e.g. "Bad Request").
        return i18n.t("errors.checkHighlightedFields", { error: body.error });
    }
    return error.statusText || i18n.t("errors.unexpected");
}
