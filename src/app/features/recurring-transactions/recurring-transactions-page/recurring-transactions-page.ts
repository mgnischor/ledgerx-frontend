import { Component, effect, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import {
    CategoryDto,
    FinancialAccountDto,
    RecurrenceFrequency,
    RecurringTransactionRuleDto,
    TransactionType,
} from "../../../core/models/accounting.model";
import { CategoryApi } from "../../../core/services/api/category.api";
import { FinancialAccountApi } from "../../../core/services/api/financial-account.api";
import { RecurringTransactionApi } from "../../../core/services/api/recurring-transaction.api";
import { CompanyContextService } from "../../../core/services/company-context.service";
import { ToastService } from "../../../core/services/toast.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";

@Component({
    selector: "app-recurring-transactions-page",
    imports: [ReactiveFormsModule, RouterLink, EmptyState],
    templateUrl: "./recurring-transactions-page.html",
    styleUrl: "./recurring-transactions-page.scss",
})
export class RecurringTransactionsPage {
    private readonly fb = inject(FormBuilder);
    private readonly recurringApi = inject(RecurringTransactionApi);
    private readonly financialAccountApi = inject(FinancialAccountApi);
    private readonly categoryApi = inject(CategoryApi);
    private readonly toast = inject(ToastService);
    protected readonly companyContext = inject(CompanyContextService);

    protected readonly types: TransactionType[] = ["INCOME", "EXPENSE"];
    protected readonly frequencies: RecurrenceFrequency[] = ["WEEKLY", "MONTHLY", "YEARLY"];
    protected readonly rules = signal<RecurringTransactionRuleDto[]>([]);
    protected readonly accounts = signal<FinancialAccountDto[]>([]);
    protected readonly categories = signal<CategoryDto[]>([]);
    protected readonly submitting = signal(false);
    protected readonly generating = signal(false);
    protected readonly showForm = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        financialAccountId: ["", [Validators.required]],
        categoryId: ["", [Validators.required]],
        type: ["EXPENSE" as TransactionType, [Validators.required]],
        amount: [0, [Validators.required, Validators.min(0.01)]],
        description: ["", [Validators.maxLength(255)]],
        frequency: ["MONTHLY" as RecurrenceFrequency, [Validators.required]],
        firstOccurrence: [this.today(), [Validators.required]],
    });

    constructor() {
        effect(() => {
            const company = this.companyContext.selectedCompany();
            if (company) {
                this.load(company.id);
                this.financialAccountApi.list(company.id).subscribe((accounts) => this.accounts.set(accounts));
                this.categoryApi.list(company.id).subscribe((categories) => this.categories.set(categories));
            } else {
                this.rules.set([]);
                this.accounts.set([]);
                this.categories.set([]);
            }
        });
    }

    protected filteredCategories(type: TransactionType): CategoryDto[] {
        return this.categories().filter((category) => category.type === type);
    }

    protected accountName(accountId: string): string {
        return this.accounts().find((a) => a.id === accountId)?.name ?? accountId;
    }

    protected categoryName(categoryId: string): string {
        return this.categories().find((c) => c.id === categoryId)?.name ?? categoryId;
    }

    protected load(companyId: string): void {
        this.recurringApi.list(companyId).subscribe((rules) => this.rules.set(rules));
    }

    protected submit(): void {
        const company = this.companyContext.selectedCompany();
        if (!company || this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        const value = this.form.getRawValue();
        this.recurringApi.create(company.id, { ...value, description: value.description || undefined }).subscribe({
            next: (rule) => {
                this.rules.update((rules) => [...rules, rule]);
                this.toast.success("Recurring rule created.");
                this.form.reset({ type: "EXPENSE", amount: 0, frequency: "MONTHLY", firstOccurrence: this.today() });
                this.showForm.set(false);
                this.submitting.set(false);
            },
            error: () => this.submitting.set(false),
        });
    }

    protected generateDue(): void {
        const company = this.companyContext.selectedCompany();
        if (!company) {
            return;
        }
        this.generating.set(true);
        this.recurringApi.generateDue(company.id).subscribe({
            next: () => {
                this.toast.success("Due recurring transactions generated.");
                this.generating.set(false);
                this.load(company.id);
            },
            error: () => this.generating.set(false),
        });
    }

    protected deactivate(rule: RecurringTransactionRuleDto): void {
        const company = this.companyContext.selectedCompany();
        if (!company || !confirm("Deactivate this recurring rule?")) {
            return;
        }
        this.recurringApi.deactivate(company.id, rule.id).subscribe({
            next: (updated) => {
                this.rules.update((rules) => rules.map((r) => (r.id === updated.id ? updated : r)));
                this.toast.success("Recurring rule deactivated.");
            },
        });
    }

    private today(): string {
        return new Date().toISOString().slice(0, 10);
    }
}
