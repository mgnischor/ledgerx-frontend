import { DecimalPipe } from "@angular/common";
import { Component, effect, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { BudgetDto, BudgetStatusDto, CategoryDto } from "../../../core/models/accounting.model";
import { BudgetApi } from "../../../core/services/api/budget.api";
import { CategoryApi } from "../../../core/services/api/category.api";
import { CompanyContextService } from "../../../core/services/company-context.service";
import { ToastService } from "../../../core/services/toast.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";

@Component({
    selector: "app-budgets-page",
    imports: [ReactiveFormsModule, RouterLink, EmptyState, DecimalPipe],
    templateUrl: "./budgets-page.html",
    styleUrl: "./budgets-page.scss",
})
export class BudgetsPage {
    private readonly fb = inject(FormBuilder);
    private readonly budgetApi = inject(BudgetApi);
    private readonly categoryApi = inject(CategoryApi);
    private readonly toast = inject(ToastService);
    protected readonly companyContext = inject(CompanyContextService);

    protected readonly budgets = signal<BudgetDto[]>([]);
    protected readonly categories = signal<CategoryDto[]>([]);
    protected readonly statuses = signal<Record<string, BudgetStatusDto>>({});
    protected readonly submitting = signal(false);
    protected readonly showForm = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        categoryId: ["", [Validators.required]],
        period: [this.currentMonth(), [Validators.required]],
        limit: [0, [Validators.required, Validators.min(0.01)]],
    });

    protected get expenseCategories(): CategoryDto[] {
        return this.categories().filter((category) => category.type === "EXPENSE");
    }

    constructor() {
        effect(() => {
            const company = this.companyContext.selectedCompany();
            if (company) {
                this.load(company.id);
                this.categoryApi.list(company.id).subscribe((categories) => this.categories.set(categories));
            } else {
                this.budgets.set([]);
                this.categories.set([]);
            }
        });
    }

    protected load(companyId: string): void {
        this.budgetApi.list(companyId).subscribe((budgets) => this.budgets.set(budgets));
    }

    protected categoryName(categoryId: string): string {
        return this.categories().find((c) => c.id === categoryId)?.name ?? categoryId;
    }

    protected submit(): void {
        const company = this.companyContext.selectedCompany();
        if (!company || this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.budgetApi.create(company.id, this.form.getRawValue()).subscribe({
            next: (budget) => {
                this.budgets.update((budgets) => [...budgets, budget]);
                this.toast.success("Budget created.");
                this.form.reset({ period: this.currentMonth(), limit: 0 });
                this.showForm.set(false);
                this.submitting.set(false);
            },
            error: () => this.submitting.set(false),
        });
    }

    protected loadStatus(budget: BudgetDto): void {
        const company = this.companyContext.selectedCompany();
        if (!company) {
            return;
        }
        this.budgetApi.status(company.id, budget.id).subscribe((status) => {
            this.statuses.update((statuses) => ({ ...statuses, [budget.id]: status }));
        });
    }

    protected deactivate(budget: BudgetDto): void {
        const company = this.companyContext.selectedCompany();
        if (!company || !confirm("Deactivate this budget?")) {
            return;
        }
        this.budgetApi.deactivate(company.id, budget.id).subscribe({
            next: (updated) => {
                this.budgets.update((budgets) => budgets.map((b) => (b.id === updated.id ? updated : b)));
                this.toast.success("Budget deactivated.");
            },
        });
    }

    private currentMonth(): string {
        return new Date().toISOString().slice(0, 7);
    }
}
