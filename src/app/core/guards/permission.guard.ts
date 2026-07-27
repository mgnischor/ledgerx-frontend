import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Permission } from "../models/identity.model";
import { AuthService } from "../services/auth.service";

/**
 * Builds a route guard that requires the current user to hold at least one of the given
 * permissions, mirroring a backend endpoint's `@PreAuthorize` permission check (e.g.
 * `PERMISSION_DEBUG`).
 *
 * @param permissions the permissions to accept; the guard passes if the user holds any one of them
 * @returns a `CanActivateFn` that allows navigation when {@link AuthService.hasPermission} is
 *   satisfied, otherwise redirects to `/`
 */
export function permissionGuard(...permissions: Permission[]): CanActivateFn {
    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (authService.hasPermission(...permissions)) {
            return true;
        }

        return router.createUrlTree(["/"]);
    };
}
