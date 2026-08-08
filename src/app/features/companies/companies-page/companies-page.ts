import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { CompanySize } from "../../../core/models/company.model";
import { CompanyApi } from "../../../core/services/api/company.api";
import { CompanyContextService } from "../../../core/services/company-context.service";
import { ToastService } from "../../../core/services/toast.service";
import { TranslationService } from "../../../core/services/translation.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";

const BRAZILIAN_STATES = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB",
    "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

@Component({
    selector: "app-companies-page",
    imports: [ReactiveFormsModule, EmptyState, TranslatePipe],
    templateUrl: "./companies-page.html",
    styleUrl: "./companies-page.scss",
})
export class CompaniesPage {
    private readonly fb = inject(FormBuilder);
    private readonly companyApi = inject(CompanyApi);
    private readonly toast = inject(ToastService);
    protected readonly companyContext = inject(CompanyContextService);
    protected readonly i18n = inject(TranslationService);

    protected readonly states = BRAZILIAN_STATES;
    protected readonly sizes: CompanySize[] = ["MEI", "MICRO", "SMALL"];
    protected readonly submitting = signal(false);
    protected readonly showForm = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        legalName: ["", [Validators.required, Validators.maxLength(150)]],
        tradeName: ["", [Validators.required, Validators.maxLength(150)]],
        cnpj: ["", [Validators.required]],
        size: ["MICRO" as CompanySize, [Validators.required]],
        street: ["", [Validators.required, Validators.maxLength(150)]],
        number: ["", [Validators.required, Validators.maxLength(20)]],
        city: ["", [Validators.required, Validators.maxLength(100)]],
        state: ["", [Validators.required]],
        zipCode: ["", [Validators.required]],
        country: ["Brazil", [Validators.required, Validators.maxLength(60)]],
    });

    /**
     * Submits the registration form, creates the company, and remembers it in the company context.
     *
     * Marks every field as touched when the form is invalid or a request is already in flight.
     */
    protected submit(): void {
        if (this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.companyApi
            .register(this.form.getRawValue())
            .pipe(finalize(() => this.submitting.set(false)))
            .subscribe({
                next: (company) => {
                    this.companyContext.remember(company);
                    this.toast.success(this.i18n.t("companies.toastRegistered", { name: company.tradeName }));
                    this.form.reset({ size: "MICRO", country: "Brazil" });
                    this.showForm.set(false);
                },
                error: () => {
                    // error toast is raised globally by the HTTP error interceptor
                },
            });
    }

    /**
     * Deactivates a company after confirmation and refreshes it in the company context.
     *
     * @param companyId the id of the company to deactivate
     * @param tradeName the company's trade name, used in the confirmation and toast messages
     */
    protected deactivate(companyId: string, tradeName: string): void {
        if (!confirm(this.i18n.t("companies.confirmDeactivate", { name: tradeName }))) {
            return;
        }
        this.companyApi.deactivate(companyId).subscribe({
            next: (company) => {
                this.companyContext.remember(company);
                this.toast.success(this.i18n.t("companies.toastDeactivated", { name: tradeName }));
            },
        });
    }

    /**
     * Selects a company as the active one in the company context.
     *
     * @param companyId the id of the company to select
     */
    protected select(companyId: string): void {
        this.companyContext.select(companyId);
        this.toast.info(this.i18n.t("companies.toastActiveCompanyUpdated"));
    }

    /**
     * Removes a company from the local company context without touching the backend.
     *
     * @param companyId the id of the company to forget
     */
    protected forget(companyId: string): void {
        this.companyContext.forget(companyId);
    }
}
