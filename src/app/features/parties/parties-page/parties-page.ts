import { Component, effect, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { DocumentType, PartyDto, PartyType } from "../../../core/models/billing.model";
import { PartyApi } from "../../../core/services/api/party.api";
import { CompanyContextService } from "../../../core/services/company-context.service";
import { ToastService } from "../../../core/services/toast.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";

@Component({
    selector: "app-parties-page",
    imports: [ReactiveFormsModule, RouterLink, EmptyState],
    templateUrl: "./parties-page.html",
    styleUrl: "./parties-page.scss",
})
export class PartiesPage {
    private readonly fb = inject(FormBuilder);
    private readonly partyApi = inject(PartyApi);
    private readonly toast = inject(ToastService);
    protected readonly companyContext = inject(CompanyContextService);

    protected readonly documentTypes: DocumentType[] = ["CPF", "CNPJ"];
    protected readonly partyTypes: PartyType[] = ["CUSTOMER", "SUPPLIER"];
    protected readonly parties = signal<PartyDto[]>([]);
    protected readonly submitting = signal(false);
    protected readonly showForm = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        name: ["", [Validators.required, Validators.maxLength(150)]],
        documentType: ["CNPJ" as DocumentType, [Validators.required]],
        document: ["", [Validators.required]],
        email: ["", [Validators.required, Validators.email]],
        type: ["CUSTOMER" as PartyType, [Validators.required]],
    });

    constructor() {
        effect(() => {
            const company = this.companyContext.selectedCompany();
            if (company) {
                this.load(company.id);
            } else {
                this.parties.set([]);
            }
        });
    }

    protected load(companyId: string): void {
        this.partyApi.list(companyId).subscribe((parties) => this.parties.set(parties));
    }

    protected submit(): void {
        const company = this.companyContext.selectedCompany();
        if (!company || this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.partyApi.create(company.id, this.form.getRawValue()).subscribe({
            next: (party) => {
                this.parties.update((parties) => [...parties, party]);
                this.toast.success(`${party.name} created.`);
                this.form.reset({ documentType: "CNPJ", type: "CUSTOMER" });
                this.showForm.set(false);
                this.submitting.set(false);
            },
            error: () => this.submitting.set(false),
        });
    }
}
