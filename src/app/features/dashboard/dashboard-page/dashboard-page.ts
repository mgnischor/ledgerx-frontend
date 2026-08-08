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
import { TranslationService } from "../../../core/services/translation.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";

@Component({
    selector: "app-dashboard-page",
    imports: [RouterLink, EmptyState, DecimalPipe, TranslatePipe],
    templateUrl: "./dashboard-page.html",
    styleUrl: "./dashboard-page.scss",
})
export class DashboardPage {
    private readonly reportApi = inject(ReportApi);
    private readonly notificationApi = inject(NotificationApi);
    protected readonly companyContext = inject(CompanyContextService);
    protected readonly i18n = inject(TranslationService);

    private readonly refresh$ = new Subject<void>();

    protected readonly loading = signal(false);
    protected readonly from = signal(this.monthsAgo(1));
    protected readonly to = signal(this.today());

    /** The cash-flow summary for the selected company and date range, or `null` while loading or after a failure. */
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

    /** The six most recent notifications for the current user. */
    protected readonly notifications = toSignal(
        this.notificationApi.list(false).pipe(map((notifications) => notifications.slice(0, 6))),
        { initialValue: [] as NotificationDto[] },
    );

    /** Whether the current summary's net result is non-negative. */
    protected readonly netPositive = computed(() => (this.summary()?.netResult ?? 0) >= 0);

    /** Triggers a reload of the summary for the selected company and date range. */
    protected applyRange(): void {
        if (this.companyContext.selectedCompany()) {
            this.refresh$.next();
        }
    }

    /** Returns today's date formatted as `YYYY-MM-DD`. */
    private today(): string {
        return new Date().toISOString().slice(0, 10);
    }

    /**
     * Returns the date `months` months before today, formatted as `YYYY-MM-DD`.
     *
     * @param months the number of months to go back
     */
    private monthsAgo(months: number): string {
        const date = new Date();
        date.setMonth(date.getMonth() - months);
        return date.toISOString().slice(0, 10);
    }
}
