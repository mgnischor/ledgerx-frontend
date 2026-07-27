import { Routes } from "@angular/router";
import { authGuard, guestGuard } from "./core/guards/auth.guard";
import { permissionGuard } from "./core/guards/permission.guard";
import { roleGuard } from "./core/guards/role.guard";

export const routes: Routes = [
    {
        path: "login",
        canActivate: [guestGuard],
        loadComponent: () => import("./features/auth/login-page/login-page").then((m) => m.LoginPage),
    },
    {
        path: "",
        canActivate: [authGuard],
        loadComponent: () => import("./layout/shell/shell").then((m) => m.Shell),
        children: [
            { path: "", pathMatch: "full", redirectTo: "dashboard" },
            {
                path: "dashboard",
                loadComponent: () =>
                    import("./features/dashboard/dashboard-page/dashboard-page").then((m) => m.DashboardPage),
            },
            {
                path: "companies",
                loadComponent: () =>
                    import("./features/companies/companies-page/companies-page").then((m) => m.CompaniesPage),
            },
            {
                path: "financial-accounts",
                loadComponent: () =>
                    import("./features/financial-accounts/financial-accounts-page/financial-accounts-page").then(
                        (m) => m.FinancialAccountsPage,
                    ),
            },
            {
                path: "categories",
                loadComponent: () =>
                    import("./features/categories/categories-page/categories-page").then((m) => m.CategoriesPage),
            },
            {
                path: "transactions",
                loadComponent: () =>
                    import("./features/transactions/transactions-page/transactions-page").then(
                        (m) => m.TransactionsPage,
                    ),
            },
            {
                path: "budgets",
                loadComponent: () => import("./features/budgets/budgets-page/budgets-page").then((m) => m.BudgetsPage),
            },
            {
                path: "recurring-transactions",
                loadComponent: () =>
                    import(
                        "./features/recurring-transactions/recurring-transactions-page/recurring-transactions-page"
                    ).then((m) => m.RecurringTransactionsPage),
            },
            {
                path: "parties",
                loadComponent: () => import("./features/parties/parties-page/parties-page").then((m) => m.PartiesPage),
            },
            {
                path: "invoices",
                loadComponent: () =>
                    import("./features/invoices/invoices-page/invoices-page").then((m) => m.InvoicesPage),
            },
            {
                path: "notifications",
                loadComponent: () =>
                    import("./features/notifications/notifications-page/notifications-page").then(
                        (m) => m.NotificationsPage,
                    ),
            },
            {
                path: "users",
                canActivate: [roleGuard("DEVELOPER", "ADMINISTRATOR")],
                loadComponent: () => import("./features/users/users-page/users-page").then((m) => m.UsersPage),
            },
            {
                path: "developer",
                canActivate: [permissionGuard("DEBUG")],
                loadComponent: () =>
                    import("./features/developer/developer-page/developer-page").then((m) => m.DeveloperPage),
            },
        ],
    },
    { path: "**", redirectTo: "" },
];
