import { Component, inject, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Subject, finalize, merge, of, switchMap } from "rxjs";
import { CategoryDto, TransactionType } from "../../../core/models/accounting.model";
import { CategoryApi } from "../../../core/services/api/category.api";
import { CompanyContextService } from "../../../core/services/company-context.service";
import { ToastService } from "../../../core/services/toast.service";
import { TranslationService } from "../../../core/services/translation.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";

@Component({
    selector: "app-categories-page",
    imports: [ReactiveFormsModule, RouterLink, EmptyState, TranslatePipe],
    templateUrl: "./categories-page.html",
    styleUrl: "./categories-page.scss",
})
export class CategoriesPage {
    private readonly fb = inject(FormBuilder);
    private readonly categoryApi = inject(CategoryApi);
    private readonly toast = inject(ToastService);
    protected readonly companyContext = inject(CompanyContextService);
    protected readonly i18n = inject(TranslationService);

    private readonly reload$ = new Subject<void>();

    protected readonly types: TransactionType[] = ["INCOME", "EXPENSE", "TRANSFER"];
    protected readonly submitting = signal(false);
    protected readonly showForm = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        name: ["", [Validators.required, Validators.maxLength(60)]],
        type: ["EXPENSE" as TransactionType, [Validators.required]],
    });

    /** The company's categories, reloaded when the selected company changes or the list is re-requested. */
    protected readonly categories = toSignal(
        merge(toObservable(this.companyContext.selectedCompany), this.reload$).pipe(
            switchMap(() => {
                const company = this.companyContext.selectedCompany();
                return company ? this.categoryApi.list(company.id) : of([]);
            }),
        ),
        { initialValue: [] as CategoryDto[] },
    );

    /**
     * Submits the category form and creates the category for the currently selected company.
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
        this.categoryApi
            .create(company.id, this.form.getRawValue())
            .pipe(finalize(() => this.submitting.set(false)))
            .subscribe({
                next: (category) => {
                    this.toast.success(this.i18n.t("categories.toastCreated", { name: category.name }));
                    this.form.reset({ type: "EXPENSE" });
                    this.showForm.set(false);
                    this.reload$.next();
                },
                error: () => {
                    // error toast is raised globally by the HTTP error interceptor
                },
            });
    }
}
