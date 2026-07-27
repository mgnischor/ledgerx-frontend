import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

/**
 * Blocks navigation to authenticated routes for a signed-out visitor, redirecting to `/login`.
 *
 * Applied to the {@link Shell} layout route so the whole authenticated app is gated in one place.
 *
 * @returns `true` if the visitor has a live session, otherwise a `UrlTree` redirecting to `/login`
 */
export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    return router.createUrlTree(["/login"]);
};

/**
 * Blocks navigation to the login route for an already-authenticated visitor, redirecting to `/`.
 *
 * The inverse of {@link authGuard}; applied to the `/login` route so a signed-in user cannot
 * navigate back to the login form.
 *
 * @returns `true` if the visitor has no live session, otherwise a `UrlTree` redirecting to `/`
 */
export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return true;
    }

    return router.createUrlTree(["/"]);
};
