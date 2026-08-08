import { DecimalPipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Subject, finalize, merge, of, switchMap } from "rxjs";
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
import { TranslationService } from "../../../core/services/translation.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";

@Component({
    selector: "app-recurring-transactions-page",
    imports: [ReactiveFormsModule, RouterLink, EmptyState, TranslatePipe, DecimalPipe],
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
    protected readonly i18n = inject(TranslationService);

    private readonly reload$ = new Subject<void>();

    protected readonly types: TransactionType[] = ["INCOME", "EXPENSE"];
    protected readonly frequencies: RecurrenceFrequency[] = ["WEEKLY", "MONTHLY", "YEARLY"];
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

    /** The company's recurring-transaction rules, reloaded when the selected company changes or the list is re-requested. */
    protected readonly rules = toSignal(
        merge(toObservable(this.companyContext.selectedCompany), this.reload$).pipe(
            switchMap(() => {
                const company = this.companyContext.selectedCompany();
                return company ? this.recurringApi.list(company.id) : of([]);
            }),
        ),
        { initialValue: [] as RecurringTransactionRuleDto[] },
    );

    /** The company's financial accounts, reloaded when the selected company changes. */
    protected readonly accounts = toSignal(
        toObservable(this.companyContext.selectedCompany).pipe(
            switchMap((company) => (company ? this.financialAccountApi.list(company.id) : of([]))),
        ),
        { initialValue: [] as FinancialAccountDto[] },
    );

    /** The company's categories, reloaded when the selected company changes. */
    protected readonly categories = toSignal(
        toObservable(this.companyContext.selectedCompany).pipe(
            switchMap((company) => (company ? this.categoryApi.list(company.id) : of([]))),
        ),
        { initialValue: [] as CategoryDto[] },
    );

    /**
     * Filters the loaded categories to a single transaction type.
     *
     * @param type the transaction type to keep
     * @returns the matching categories
     */
    protected filteredCategories(type: TransactionType): CategoryDto[] {
        return this.categories().filter((category) => category.type === type);
    }

    /**
     * Resolves a financial-account id to its display name.
     *
     * @param accountId the account's id
     * @returns the account name, or the id itself when unknown
     */
    protected accountName(accountId: string): string {
        return this.accounts().find((a) => a.id === accountId)?.name ?? accountId;
    }

    /**
     * Resolves a category id to its display name.
     *
     * @param categoryId the category's id
     * @returns the category name, or the id itself when unknown
     */
    protected categoryName(categoryId: string): string {
        return this.categories().find((c) => c.id === categoryId)?.name ?? categoryId;
    }

    /**
     * Submits the rule form and creates the recurring-transaction rule for the selected company.
     *
     * Marks every field as touched when the form is invalid or a request is already in flight.
     */
    protected submit(): void {
        const company = this.companyContext.selectedCompany();
        if (!company || this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        const value = this.form.getRawValue();
        this.recurringApi
            .create(company.id, { ...value, description: value.description || undefined })
            .pipe(finalize(() => this.submitting.set(false)))
            .subscribe({
                next: () => {
                    this.toast.success(this.i18n.t("recurringTransactions.toastCreated"));
                    this.form.reset({
                        type: "EXPENSE",
                        amount: 0,
                        frequency: "MONTHLY",
                        firstOccurrence: this.today(),
                    });
                    this.showForm.set(false);
                    this.reload$.next();
                },
                error: () => {
                    // error toast is raised globally by the HTTP error interceptor
                },
            });
    }

    /** Materializes every due recurring-transaction rule and reloads the list. */
    protected generateDue(): void {
        const company = this.companyContext.selectedCompany();
        if (!company) {
            return;
        }
        this.generating.set(true);
        this.recurringApi
            .generateDue(company.id)
            .pipe(finalize(() => this.generating.set(false)))
            .subscribe({
                next: () => {
                    this.toast.success(this.i18n.t("recurringTransactions.toastGenerated"));
                    this.reload$.next();
                },
                error: () => {
                    // error toast is raised globally by the HTTP error interceptor
                },
            });
    }

    /**
     * Deactivates a recurring-transaction rule after confirmation and reloads the list.
     *
     * @param rule the rule to deactivate
     */
    protected deactivate(rule: RecurringTransactionRuleDto): void {
        const company = this.companyContext.selectedCompany();
        if (!company || !confirm(this.i18n.t("recurringTransactions.confirmDeactivate"))) {
            return;
        }
        this.recurringApi.deactivate(company.id, rule.id).subscribe({
            next: () => {
                this.toast.success(this.i18n.t("recurringTransactions.toastDeactivated"));
                this.reload$.next();
            },
        });
    }

    /** Returns today's date formatted as `YYYY-MM-DD`. */
    private today(): string {
        return new Date().toISOString().slice(0, 10);
    }
}
