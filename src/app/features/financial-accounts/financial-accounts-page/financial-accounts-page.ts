import { DecimalPipe } from "@angular/common";
import { Component, effect, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
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

    protected readonly accounts = signal<FinancialAccountDto[]>([]);
    protected readonly loading = signal(false);
    protected readonly submitting = signal(false);
    protected readonly showForm = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        name: ["", [Validators.required, Validators.maxLength(100)]],
        openingBalance: [0, [Validators.required, Validators.min(0)]],
    });

    constructor() {
        effect(() => {
            const company = this.companyContext.selectedCompany();
            if (company) {
                this.load(company.id);
            } else {
                this.accounts.set([]);
            }
        });
    }

    protected load(companyId: string): void {
        this.loading.set(true);
        this.financialAccountApi.list(companyId).subscribe({
            next: (accounts) => {
                this.accounts.set(accounts);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    protected submit(): void {
        const company = this.companyContext.selectedCompany();
        if (!company || this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        const { name, openingBalance } = this.form.getRawValue();
        this.financialAccountApi.create(company.id, { companyId: company.id, name, openingBalance }).subscribe({
            next: (account) => {
                this.accounts.update((accounts) => [...accounts, account]);
                this.toast.success(`${account.name} created.`);
                this.form.reset({ openingBalance: 0 });
                this.showForm.set(false);
                this.submitting.set(false);
            },
            error: () => this.submitting.set(false),
        });
    }

    protected deactivate(account: FinancialAccountDto): void {
        const company = this.companyContext.selectedCompany();
        if (!company || !confirm(`Deactivate ${account.name}?`)) {
            return;
        }
        this.financialAccountApi.deactivate(company.id, account.id).subscribe({
            next: (updated) => {
                this.accounts.update((accounts) => accounts.map((a) => (a.id === updated.id ? updated : a)));
                this.toast.success(`${account.name} deactivated.`);
            },
        });
    }
}
