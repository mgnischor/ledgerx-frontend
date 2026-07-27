import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Role } from "../models/identity.model";
import { AuthService } from "../services/auth.service";

/**
 * Builds a route guard that requires the current user to hold at least one of the given roles,
 * mirroring a backend endpoint's `@PreAuthorize` role check (e.g. `DEVELOPER`/`ADMINISTRATOR`).
 *
 * @param roles the roles to accept; the guard passes if the user holds any one of them
 * @returns a `CanActivateFn` that allows navigation when {@link AuthService.hasRole} is satisfied,
 *   otherwise redirects to `/`
 */
export function roleGuard(...roles: Role[]): CanActivateFn {
    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (authService.hasRole(...roles)) {
            return true;
        }

        return router.createUrlTree(["/"]);
    };
}
