import { Component, OnInit, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CompanyContextService } from "../../core/services/company-context.service";
import { NotificationApi } from "../../core/services/api/notification.api";
import { AuthService } from "../../core/services/auth.service";

interface NavItem {
    label: string;
    path: string;
    icon: string;
    requiresCompany?: boolean;
    roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: "layout-dashboard" },
    { label: "Companies", path: "/companies", icon: "building" },
    { label: "Financial Accounts", path: "/financial-accounts", icon: "wallet", requiresCompany: true },
    { label: "Categories", path: "/categories", icon: "tags", requiresCompany: true },
    { label: "Transactions", path: "/transactions", icon: "arrow-left-right", requiresCompany: true },
    { label: "Budgets", path: "/budgets", icon: "target", requiresCompany: true },
    { label: "Recurring Rules", path: "/recurring-transactions", icon: "repeat", requiresCompany: true },
    { label: "Parties", path: "/parties", icon: "users", requiresCompany: true },
    { label: "Invoices", path: "/invoices", icon: "file-text", requiresCompany: true },
    { label: "Notifications", path: "/notifications", icon: "bell" },
    { label: "Users", path: "/users", icon: "shield", roles: ["DEVELOPER", "ADMINISTRATOR"] },
];

@Component({
    selector: "app-shell",
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: "./shell.html",
    styleUrl: "./shell.scss",
})
export class Shell implements OnInit {
    protected readonly authService = inject(AuthService);
    protected readonly companyContext = inject(CompanyContextService);
    private readonly notificationApi = inject(NotificationApi);
    private readonly router = inject(Router);

    protected readonly unreadCount = signal(0);
    protected readonly sidebarOpen = signal(false);

    protected readonly navItems = NAV_ITEMS.filter(
        (item) => !item.roles || this.authService.hasRole(...(item.roles as never[])),
    );

    ngOnInit(): void {
        this.refreshUnreadCount();
    }

    protected refreshUnreadCount(): void {
        this.notificationApi.list(true).subscribe({
            next: (notifications) => this.unreadCount.set(notifications.length),
            error: () => this.unreadCount.set(0),
        });
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
