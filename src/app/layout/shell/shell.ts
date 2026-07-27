import { Component, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { Subject, map, switchMap } from "rxjs";
import { Permission, Role } from "../../core/models/identity.model";
import { CompanyContextService } from "../../core/services/company-context.service";
import { NotificationApi } from "../../core/services/api/notification.api";
import { AuthService } from "../../core/services/auth.service";
import { TranslationService } from "../../core/services/translation.service";
import { LanguageSwitcher } from "../../shared/components/language-switcher/language-switcher";
import { TranslatePipe } from "../../shared/pipes/translate.pipe";

interface NavItem {
    labelKey: string;
    path: string;
    roles?: Role[];
    permissions?: Permission[];
}

const NAV_ITEMS: NavItem[] = [
    { labelKey: "nav.dashboard", path: "/dashboard" },
    { labelKey: "nav.companies", path: "/companies" },
    { labelKey: "nav.financialAccounts", path: "/financial-accounts" },
    { labelKey: "nav.categories", path: "/categories" },
    { labelKey: "nav.transactions", path: "/transactions" },
    { labelKey: "nav.budgets", path: "/budgets" },
    { labelKey: "nav.recurringRules", path: "/recurring-transactions" },
    { labelKey: "nav.parties", path: "/parties" },
    { labelKey: "nav.invoices", path: "/invoices" },
    { labelKey: "nav.notifications", path: "/notifications" },
    { labelKey: "nav.users", path: "/users", roles: ["DEVELOPER", "ADMINISTRATOR"] },
    { labelKey: "nav.developer", path: "/developer", permissions: ["DEBUG"] },
];

@Component({
    selector: "app-shell",
    imports: [RouterOutlet, RouterLink, RouterLinkActive, LanguageSwitcher, TranslatePipe],
    templateUrl: "./shell.html",
    styleUrl: "./shell.scss",
})
export class Shell {
    protected readonly authService = inject(AuthService);
    protected readonly companyContext = inject(CompanyContextService);
    protected readonly i18n = inject(TranslationService);
    private readonly notificationApi = inject(NotificationApi);
    private readonly router = inject(Router);

    private readonly refreshUnread$ = new Subject<void>();

    protected readonly sidebarOpen = signal(false);

    protected readonly navItems = NAV_ITEMS.filter(
        (item) =>
            (!item.roles || this.authService.hasRole(...item.roles)) &&
            (!item.permissions || this.authService.hasPermission(...item.permissions)),
    );

    protected readonly unreadCount = toSignal(
        this.refreshUnread$.pipe(
            switchMap(() => this.notificationApi.list(true)),
            map((notifications) => notifications.length),
        ),
        { initialValue: 0 },
    );

    constructor() {
        this.refreshUnread$.next();
    }

    protected selectCompany(companyId: string): void {
        this.companyContext.select(companyId);
    }

    protected toggleSidebar(): void {
        this.sidebarOpen.update((open) => !open);
    }

    protected logout(): void {
        this.authService.logout();
        this.router.navigateByUrl("/login");
    }

    protected initials(email: string | null): string {
        if (!email) {
            return "?";
        }
        return email.slice(0, 2).toUpperCase();
    }
}
