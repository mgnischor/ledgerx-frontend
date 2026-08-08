import { Component, inject, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Subject, finalize, merge, of, switchMap } from "rxjs";
import { CategoryDto, FinancialAccountDto, TransactionType } from "../../../core/models/accounting.model";
import { CategoryApi } from "../../../core/services/api/category.api";
import { FinancialAccountApi } from "../../../core/services/api/financial-account.api";
import { TransactionApi } from "../../../core/services/api/transaction.api";
import { CompanyContextService } from "../../../core/services/company-context.service";
import { ToastService } from "../../../core/services/toast.service";
import { TranslationService } from "../../../core/services/translation.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";

type Tab = "transaction" | "transfer";

@Component({
    selector: "app-transactions-page",
    imports: [ReactiveFormsModule, RouterLink, EmptyState, TranslatePipe],
    templateUrl: "./transactions-page.html",
    styleUrl: "./transactions-page.scss",
})
export class TransactionsPage {
    private readonly fb = inject(FormBuilder);
    private readonly financialAccountApi = inject(FinancialAccountApi);
    private readonly categoryApi = inject(CategoryApi);
    private readonly transactionApi = inject(TransactionApi);
    private readonly toast = inject(ToastService);
    protected readonly companyContext = inject(CompanyContextService);
    protected readonly i18n = inject(TranslationService);

    private readonly reloadAccounts$ = new Subject<void>();

    protected readonly tab = signal<Tab>("transaction");
    protected readonly types: TransactionType[] = ["INCOME", "EXPENSE"];
    protected readonly submitting = signal(false);
    protected readonly transferSubmitting = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        financialAccountId: ["", [Validators.required]],
        categoryId: ["", [Validators.required]],
        type: ["EXPENSE" as TransactionType, [Validators.required]],
        amount: [0, [Validators.required, Validators.min(0.01)]],
        occurredOn: [this.today(), [Validators.required]],
        description: ["", [Validators.maxLength(255)]],
    });

    protected readonly transferForm = this.fb.nonNullable.group({
        fromAccountId: ["", [Validators.required]],
        toAccountId: ["", [Validators.required]],
        amount: [0, [Validators.required, Validators.min(0.01)]],
    });

    /** The company's financial accounts, reloaded when the selected company changes or the list is re-requested. */
    protected readonly accounts = toSignal(
        merge(toObservable(this.companyContext.selectedCompany), this.reloadAccounts$).pipe(
            switchMap(() => {
                const company = this.companyContext.selectedCompany();
                return company ? this.financialAccountApi.list(company.id) : of([]);
            }),
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
     * Translates a transaction type and lowercases it, e.g. for the form's labels.
     *
     * @param type the transaction type to translate
     * @returns the lowercased localized label
     */
    protected typeLabelLower(type: TransactionType): string {
        return this.i18n.t(`enums.transactionType.${type}`).toLowerCase();
    }

    /**
     * Submits the transaction form and records the movement.
     *
     * Marks every field as touched when the form is invalid or a request is already in flight.
     */
    protected submitTransaction(): void {
        if (this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        const value = this.form.getRawValue();
        this.transactionApi
            .record({ ...value, description: value.description || undefined })
            .pipe(finalize(() => this.submitting.set(false)))
            .subscribe({
                next: () => {
                    this.toast.success(this.i18n.t("transactions.toastRecorded"));
                    this.form.reset({ type: "EXPENSE", amount: 0, occurredOn: this.today() });
                    this.reloadAccounts$.next();
                },
                error: () => {
                    // error toast is raised globally by the HTTP error interceptor
                },
            });
    }

    /**
     * Submits the transfer form and moves funds between the two selected accounts.
     *
     * Marks every field as touched when the form is invalid or a request is already in flight.
     */
    protected submitTransfer(): void {
        if (this.transferForm.invalid || this.transferSubmitting()) {
            this.transferForm.markAllAsTouched();
            return;
        }

        this.transferSubmitting.set(true);
        this.transactionApi
            .transfer(this.transferForm.getRawValue())
            .pipe(finalize(() => this.transferSubmitting.set(false)))
            .subscribe({
                next: () => {
                    this.toast.success(this.i18n.t("transactions.toastTransferred"));
                    this.transferForm.reset({ amount: 0 });
                    this.reloadAccounts$.next();
                },
                error: () => {
                    // error toast is raised globally by the HTTP error interceptor
                },
            });
    }

    /** Returns today's date formatted as `YYYY-MM-DD`. */
    private today(): string {
        return new Date().toISOString().slice(0, 10);
    }
}
