import { DecimalPipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Subject, finalize, merge, of, switchMap } from "rxjs";
import { BudgetDto, BudgetStatusDto, CategoryDto } from "../../../core/models/accounting.model";
import { BudgetApi } from "../../../core/services/api/budget.api";
import { CategoryApi } from "../../../core/services/api/category.api";
import { CompanyContextService } from "../../../core/services/company-context.service";
import { ToastService } from "../../../core/services/toast.service";
import { TranslationService } from "../../../core/services/translation.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";

@Component({
    selector: "app-budgets-page",
    imports: [ReactiveFormsModule, RouterLink, EmptyState, DecimalPipe, TranslatePipe],
    templateUrl: "./budgets-page.html",
    styleUrl: "./budgets-page.scss",
})
export class BudgetsPage {
    private readonly fb = inject(FormBuilder);
    private readonly budgetApi = inject(BudgetApi);
    private readonly categoryApi = inject(CategoryApi);
    private readonly toast = inject(ToastService);
    protected readonly companyContext = inject(CompanyContextService);
    protected readonly i18n = inject(TranslationService);

    private readonly reload$ = new Subject<void>();

    protected readonly statuses = signal<Record<string, BudgetStatusDto>>({});
    protected readonly submitting = signal(false);
    protected readonly showForm = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        categoryId: ["", [Validators.required]],
        period: [this.currentMonth(), [Validators.required]],
        limit: [0, [Validators.required, Validators.min(0.01)]],
    });

    /** The company's budgets, reloaded when the selected company changes or the list is re-requested. */
    protected readonly budgets = toSignal(
        merge(toObservable(this.companyContext.selectedCompany), this.reload$).pipe(
            switchMap(() => {
                const company = this.companyContext.selectedCompany();
                return company ? this.budgetApi.list(company.id) : of([]);
            }),
        ),
        { initialValue: [] as BudgetDto[] },
    );

    /** The company's categories, reloaded when the selected company changes. */
    protected readonly categories = toSignal(
        toObservable(this.companyContext.selectedCompany).pipe(
            switchMap((company) => (company ? this.categoryApi.list(company.id) : of([]))),
        ),
        { initialValue: [] as CategoryDto[] },
    );

    /** The loaded categories restricted to expense types, which budgets are attached to. */
    protected get expenseCategories(): CategoryDto[] {
        return this.categories().filter((category) => category.type === "EXPENSE");
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
     * Submits the budget form and creates the budget for the currently selected company.
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
        this.budgetApi
            .create(company.id, this.form.getRawValue())
            .pipe(finalize(() => this.submitting.set(false)))
            .subscribe({
                next: () => {
                    this.toast.success(this.i18n.t("budgets.toastCreated"));
                    this.form.reset({ period: this.currentMonth(), limit: 0 });
                    this.showForm.set(false);
                    this.reload$.next();
                },
                error: () => {
                    // error toast is raised globally by the HTTP error interceptor
                },
            });
    }

    /**
     * Fetches and caches the spend-vs-limit status for a budget.
     *
     * @param budget the budget whose status to load
     */
    protected loadStatus(budget: BudgetDto): void {
        const company = this.companyContext.selectedCompany();
        if (!company) {
            return;
        }
        this.budgetApi.status(company.id, budget.id).subscribe((status) => {
            this.statuses.update((statuses) => ({ ...statuses, [budget.id]: status }));
        });
    }

    /**
     * Deactivates a budget after confirmation and reloads the list.
     *
     * @param budget the budget to deactivate
     */
    protected deactivate(budget: BudgetDto): void {
        const company = this.companyContext.selectedCompany();
        if (!company || !confirm(this.i18n.t("budgets.confirmDeactivate"))) {
            return;
        }
        this.budgetApi.deactivate(company.id, budget.id).subscribe({
            next: () => {
                this.toast.success(this.i18n.t("budgets.toastDeactivated"));
                this.reload$.next();
            },
        });
    }

    /** Returns the current calendar month formatted as `YYYY-MM`. */
    private currentMonth(): string {
        return new Date().toISOString().slice(0, 7);
    }
}
