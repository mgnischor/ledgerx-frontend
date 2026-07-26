import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { ApiError } from "../models/common.model";
import { AuthService } from "../services/auth.service";
import { ToastService } from "../services/toast.service";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toast = inject(ToastService);
    const authService = inject(AuthService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse) {
                if (error.status === 401) {
                    authService.logout();
                    router.navigate(["/login"]);
                    toast.error("Your session has expired. Please sign in again.");
                } else {
                    toast.error(extractMessage(error));
                }
            }
            return throwError(() => error);
        }),
    );
};

function extractMessage(error: HttpErrorResponse): string {
    const body = error.error as ApiError | undefined;

    if (body?.message) {
        return body.details?.length ? `${body.message} ${body.details.join(" ")}` : body.message;
    }
    if (body?.details?.length) {
        return body.details.join(" ");
    }
    if (body?.error) {
        // Spring Boot's default error body for uncaught 400s (e.g. @Valid failures) carries no
        // per-field detail, only the short reason phrase (e.g. "Bad Request").
        return `${body.error}. Check the highlighted fields and try again.`;
    }
    return error.statusText || "An unexpected error occurred.";
}
