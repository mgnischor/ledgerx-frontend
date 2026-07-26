import { DecimalPipe } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { Subject, catchError, filter, finalize, map, merge, of, switchMap } from "rxjs";
import { NotificationDto } from "../../../core/models/notification.model";
import { CashFlowSummary } from "../../../core/models/reporting.model";
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

    private readonly refresh$ = new Subject<void>();

    protected readonly loading = signal(false);
    protected readonly from = signal(this.monthsAgo(1));
    protected readonly to = signal(this.today());

    protected readonly summary = toSignal(
        merge(toObservable(this.companyContext.selectedCompany), this.refresh$).pipe(
            map(() => this.companyContext.selectedCompany()),
            filter((company): company is NonNullable<typeof company> => !!company),
            switchMap((company) => {
                this.loading.set(true);
                return this.reportApi.cashFlow(company.id, this.from(), this.to()).pipe(
                    catchError(() => of(null)),
                    finalize(() => this.loading.set(false)),
                );
            }),
        ),
        { initialValue: null as CashFlowSummary | null },
    );

    protected readonly notifications = toSignal(
        this.notificationApi.list(false).pipe(map((notifications) => notifications.slice(0, 6))),
        { initialValue: [] as NotificationDto[] },
    );

    protected readonly netPositive = computed(() => (this.summary()?.netResult ?? 0) >= 0);

    protected applyRange(): void {
        if (this.companyContext.selectedCompany()) {
            this.refresh$.next();
        }
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
