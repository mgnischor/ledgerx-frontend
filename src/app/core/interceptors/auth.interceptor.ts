import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";

/**
 * Attaches the current session's bearer token, if any, to every outgoing HTTP request.
 *
 * Requests fired before login (or after logout) pass through unmodified — the backend rejects
 * them with `401`, which {@link errorInterceptor} then handles.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.accessToken;

    if (!token) {
        return next(req);
    }

    return next(
        req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        }),
    );
};
