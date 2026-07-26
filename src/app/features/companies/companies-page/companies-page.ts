import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { CompanySize } from "../../../core/models/company.model";
import { CompanyApi } from "../../../core/services/api/company.api";
import { CompanyContextService } from "../../../core/services/company-context.service";
import { ToastService } from "../../../core/services/toast.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";

const BRAZILIAN_STATES = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB",
    "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

@Component({
    selector: "app-companies-page",
    imports: [ReactiveFormsModule, EmptyState],
    templateUrl: "./companies-page.html",
    styleUrl: "./companies-page.scss",
})
export class CompaniesPage {
    private readonly fb = inject(FormBuilder);
    private readonly companyApi = inject(CompanyApi);
    private readonly toast = inject(ToastService);
    protected readonly companyContext = inject(CompanyContextService);

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
                    this.toast.success(`${company.tradeName} registered.`);
                    this.form.reset({ size: "MICRO", country: "Brazil" });
                    this.showForm.set(false);
                },
                error: () => {
                    // error toast is raised globally by the HTTP error interceptor
                },
            });
    }

    protected deactivate(companyId: string, tradeName: string): void {
        if (!confirm(`Deactivate ${tradeName}? This cannot be undone from the UI.`)) {
            return;
        }
        this.companyApi.deactivate(companyId).subscribe({
            next: (company) => {
                this.companyContext.remember(company);
                this.toast.success(`${tradeName} deactivated.`);
            },
        });
    }

    protected select(companyId: string): void {
        this.companyContext.select(companyId);
        this.toast.info("Active company updated.");
    }

    protected forget(companyId: string): void {
        this.companyContext.forget(companyId);
    }
}
