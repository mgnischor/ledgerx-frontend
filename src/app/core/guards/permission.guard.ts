import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Permission } from "../models/identity.model";
import { AuthService } from "../services/auth.service";

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
