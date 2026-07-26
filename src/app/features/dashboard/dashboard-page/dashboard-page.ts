import { DecimalPipe } from "@angular/common";
import { Component, computed, effect, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CashFlowSummary } from "../../../core/models/reporting.model";
import { NotificationDto } from "../../../core/models/notification.model";
import { NotificationApi } from "../../../core/services/api/notification.api";
import { ReportApi } from "../../../core/services/api/report.api";
import { CompanyContextService } from "../../../core/services/company-context.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";

@Component({
    selector: "app-dashboard-page",
    imports: [RouterLink, EmptyState, DecimalPipe],
    templateUrl: "./dashboard-page.html",
    styleUrl: "./dashboard-page.scss",
})
export class DashboardPage {
    private readonly reportApi = inject(ReportApi);
    private readonly notificationApi = inject(NotificationApi);
    protected readonly companyContext = inject(CompanyContextService);

    protected readonly loading = signal(false);
    protected readonly summary = signal<CashFlowSummary | null>(null);
    protected readonly notifications = signal<NotificationDto[]>([]);
    protected readonly from = signal(this.monthsAgo(1));
    protected readonly to = signal(this.today());

    protected readonly netPositive = computed(() => (this.summary()?.netResult ?? 0) >= 0);

    constructor() {
        effect(() => {
            const company = this.companyContext.selectedCompany();
            if (company) {
                this.loadReport(company.id);
            } else {
                this.summary.set(null);
            }
        });
        this.loadNotifications();
    }

    protected loadReport(companyId: string): void {
        this.loading.set(true);
        this.reportApi.cashFlow(companyId, this.from(), this.to()).subscribe({
            next: (summary) => {
                this.summary.set(summary);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    protected applyRange(): void {
        const company = this.companyContext.selectedCompany();
        if (company) {
            this.loadReport(company.id);
        }
    }

    protected loadNotifications(): void {
        this.notificationApi.list(false).subscribe({
            next: (notifications) => this.notifications.set(notifications.slice(0, 6)),
        });
    }

    private today(): string {
        return new Date().toISOString().slice(0, 10);
    }

    private monthsAgo(months: number): string {
        const date = new Date();
        date.setMonth(date.getMonth() - months);
        return date.toISOString().slice(0, 10);
    }
}
