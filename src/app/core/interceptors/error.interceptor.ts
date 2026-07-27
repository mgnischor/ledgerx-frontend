import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { ApiError } from "../models/common.model";
import { AuthService } from "../services/auth.service";
import { ToastService } from "../services/toast.service";
import { TranslationService } from "../services/translation.service";

/**
 * Surfaces every failed HTTP request as a toast and re-throws it so callers can still react
 * locally (e.g. to reset a "submitting" flag via `finalize`).
 *
 * A `401 Unauthorized` is treated specially: it logs the user out and redirects to `/login`,
 * since it means the session has expired or been revoked. Every other error status is passed to
 * {@link extractMessage} to build a human-readable toast message.
 */
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

/**
 * Derives a human-readable message from a failed HTTP response.
 *
 * The backend returns two different shapes depending on whether the exception was caught by its
 * `GlobalExceptionHandler`: a structured {@link ApiError} with `message`/`details` for handled
 * exceptions (404/422/401/403), or Spring Boot's bare default error body (`timestamp`/`status`/
 * `error`/`path`, no `message`) for uncaught `@Valid` bean-validation failures (400). This function
 * degrades gracefully through both cases.
 *
 * @param error the failed HTTP response
 * @param i18n  used to localize the client-side fallback messages; text sourced from the backend
 *   itself (`message`/`details`) is passed through unlocalized, since the API only replies in
 *   English
 * @returns the best available human-readable error message
 */
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
