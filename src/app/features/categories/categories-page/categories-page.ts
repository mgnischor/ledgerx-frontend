import { Component, effect, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CategoryDto, TransactionType } from "../../../core/models/accounting.model";
import { CategoryApi } from "../../../core/services/api/category.api";
import { CompanyContextService } from "../../../core/services/company-context.service";
import { ToastService } from "../../../core/services/toast.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";

@Component({
    selector: "app-categories-page",
    imports: [ReactiveFormsModule, RouterLink, EmptyState],
    templateUrl: "./categories-page.html",
    styleUrl: "./categories-page.scss",
})
export class CategoriesPage {
    private readonly fb = inject(FormBuilder);
    private readonly categoryApi = inject(CategoryApi);
    private readonly toast = inject(ToastService);
    protected readonly companyContext = inject(CompanyContextService);

    protected readonly types: TransactionType[] = ["INCOME", "EXPENSE", "TRANSFER"];
    protected readonly categories = signal<CategoryDto[]>([]);
    protected readonly submitting = signal(false);
    protected readonly showForm = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        name: ["", [Validators.required, Validators.maxLength(60)]],
        type: ["EXPENSE" as TransactionType, [Validators.required]],
    });

    constructor() {
        effect(() => {
            const company = this.companyContext.selectedCompany();
            if (company) {
                this.load(company.id);
            } else {
                this.categories.set([]);
            }
        });
    }

    protected load(companyId: string): void {
        this.categoryApi.list(companyId).subscribe({
            next: (categories) => this.categories.set(categories),
        });
    }

    protected submit(): void {
        const company = this.companyContext.selectedCompany();
        if (!company || this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.categoryApi.create(company.id, this.form.getRawValue()).subscribe({
            next: (category) => {
                this.categories.update((categories) => [...categories, category]);
                this.toast.success(`${category.name} created.`);
                this.form.reset({ type: "EXPENSE" });
                this.showForm.set(false);
                this.submitting.set(false);
            },
            error: () => this.submitting.set(false),
        });
    }
}
