import { DecimalPipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Subject, finalize, merge, of, switchMap } from "rxjs";
import { FinancialAccountDto } from "../../../core/models/accounting.model";
import { FinancialAccountApi } from "../../../core/services/api/financial-account.api";
import { CompanyContextService } from "../../../core/services/company-context.service";
import { ToastService } from "../../../core/services/toast.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";

@Component({
    selector: "app-financial-accounts-page",
    imports: [ReactiveFormsModule, RouterLink, EmptyState, DecimalPipe],
    templateUrl: "./financial-accounts-page.html",
    styleUrl: "./financial-accounts-page.scss",
})
export class FinancialAccountsPage {
    private readonly fb = inject(FormBuilder);
    private readonly financialAccountApi = inject(FinancialAccountApi);
    private readonly toast = inject(ToastService);
    protected readonly companyContext = inject(CompanyContextService);

    private readonly reload$ = new Subject<void>();

    protected readonly submitting = signal(false);
    protected readonly showForm = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        name: ["", [Validators.required, Validators.maxLength(100)]],
        openingBalance: [0, [Validators.required, Validators.min(0)]],
    });

    protected readonly accounts = toSignal(
        merge(toObservable(this.companyContext.selectedCompany), this.reload$).pipe(
            switchMap(() => {
                const company = this.companyContext.selectedCompany();
                return company ? this.financialAccountApi.list(company.id) : of([]);
            }),
        ),
        { initialValue: [] as FinancialAccountDto[] },
    );

    protected submit(): void {
        const company = this.companyContext.selectedCompany();
        if (!company || this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        const { name, openingBalance } = this.form.getRawValue();
        this.financialAccountApi
            .create(company.id, { companyId: company.id, name, openingBalance })
            .pipe(finalize(() => this.submitting.set(false)))
            .subscribe({
                next: (account) => {
                    this.toast.success(`${account.name} created.`);
                    this.form.reset({ openingBalance: 0 });
                    this.showForm.set(false);
                    this.reload$.next();
                },
                error: () => {
                    // error toast is raised globally by the HTTP error interceptor
                },
            });
    }

    protected deactivate(account: FinancialAccountDto): void {
        const company = this.companyContext.selectedCompany();
        if (!company || !confirm(`Deactivate ${account.name}?`)) {
            return;
        }
        this.financialAccountApi.deactivate(company.id, account.id).subscribe({
            next: () => {
                this.toast.success(`${account.name} deactivated.`);
                this.reload$.next();
            },
        });
    }
}
