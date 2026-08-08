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

    /** The navigation entries the current user's roles and permissions allow, in display order. */
    protected readonly navItems = NAV_ITEMS.filter(
        (item) =>
            (!item.roles || this.authService.hasRole(...item.roles)) &&
            (!item.permissions || this.authService.hasPermission(...item.permissions)),
    );

    /** The current user's unread-notification count, refreshed on demand. */
    protected readonly unreadCount = toSignal(
        this.refreshUnread$.pipe(
            switchMap(() => this.notificationApi.list(true)),
            map((notifications) => notifications.length),
        ),
        { initialValue: 0 },
    );

    /** Kicks off the initial unread-notification count and refreshes the company context. */
    constructor() {
        this.refreshUnread$.next();
        this.companyContext.refresh();
    }

    /**
     * Selects a company as the active one in the company context.
     *
     * @param companyId the id of the company to select
     */
    protected selectCompany(companyId: string): void {
        this.companyContext.select(companyId);
    }

    /** Toggles the sidebar's open/closed state. */
    protected toggleSidebar(): void {
        this.sidebarOpen.update((open) => !open);
    }

    /** Signs the user out and navigates to the login page. */
    protected logout(): void {
        this.authService.logout();
        this.router.navigateByUrl("/login");
    }

    /**
     * Derives a short two-character avatar label from an email address.
     *
     * @param email the user's email, or `null` when signed out
     * @returns the first two characters of the email uppercased, or `?` when absent
     */
    protected initials(email: string | null): string {
        if (!email) {
            return "?";
        }
        return email.slice(0, 2).toUpperCase();
    }
}
