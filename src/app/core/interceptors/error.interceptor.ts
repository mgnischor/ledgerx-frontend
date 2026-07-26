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
        return body.message;
    }
    if (body?.errors) {
        return Object.values(body.errors).join(" ");
    }
    return error.statusText || "An unexpected error occurred.";
}
