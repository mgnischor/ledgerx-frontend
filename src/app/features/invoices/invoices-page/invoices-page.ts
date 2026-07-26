import { Component, effect, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { InvoiceDto, PartyDto, PartyType } from "../../../core/models/billing.model";
import { InvoiceApi } from "../../../core/services/api/invoice.api";
import { PartyApi } from "../../../core/services/api/party.api";
import { CompanyContextService } from "../../../core/services/company-context.service";
import { ToastService } from "../../../core/services/toast.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";

@Component({
    selector: "app-invoices-page",
    imports: [ReactiveFormsModule, RouterLink, EmptyState],
    templateUrl: "./invoices-page.html",
    styleUrl: "./invoices-page.scss",
})
export class InvoicesPage {
    private readonly fb = inject(FormBuilder);
    private readonly invoiceApi = inject(InvoiceApi);
    private readonly partyApi = inject(PartyApi);
    private readonly toast = inject(ToastService);
    private readonly route = inject(ActivatedRoute);
    protected readonly companyContext = inject(CompanyContextService);

    protected readonly directions: PartyType[] = ["CUSTOMER", "SUPPLIER"];
    protected readonly parties = signal<PartyDto[]>([]);
    protected readonly issuedInvoices = signal<InvoiceDto[]>([]);
    protected readonly submitting = signal(false);
    protected readonly showForm = signal(false);

    protected readonly lookupId = signal("");
    protected readonly lookedUpInvoice = signal<InvoiceDto | null>(null);
    protected readonly looking = signal(false);
    protected readonly installmentId = signal("");
    protected readonly paidOn = signal(this.today());

    protected readonly form = this.fb.nonNullable.group({
        partyId: ["", [Validators.required]],
        direction: ["CUSTOMER" as PartyType, [Validators.required]],
        firstDueDate: [this.today(), [Validators.required]],
        installmentAmounts: ["", [Validators.required]],
    });

    constructor() {
        effect(() => {
            const company = this.companyContext.selectedCompany();
            if (company) {
                this.partyApi.list(company.id).subscribe((parties) => this.parties.set(parties));
            } else {
                this.parties.set([]);
            }
        });

        const partyId = this.route.snapshot.queryParamMap.get("partyId");
        if (partyId) {
            this.form.patchValue({ partyId });
            this.showForm.set(true);
        }
    }

    protected partyName(partyId: string): string {
        return this.parties().find((p) => p.id === partyId)?.name ?? partyId;
    }

    protected submit(): void {
        const company = this.companyContext.selectedCompany();
        if (!company || this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const amounts = this.form
            .getRawValue()
            .installmentAmounts.split(",")
            .map((value) => Number(value.trim()))
            .filter((value) => !Number.isNaN(value) && value > 0);

        if (amounts.length === 0) {
            this.toast.error("Enter at least one valid installment amount.");
            return;
        }

        this.submitting.set(true);
        const { partyId, direction, firstDueDate } = this.form.getRawValue();
        this.invoiceApi
            .issue({ companyId: company.id, partyId, direction, installmentAmounts: amounts, firstDueDate })
            .subscribe({
                next: (invoice) => {
                    this.issuedInvoices.update((invoices) => [invoice, ...invoices]);
                    this.toast.success(`Invoice issued with ${invoice.installmentCount} installment(s).`);
                    this.form.reset({ direction: "CUSTOMER", firstDueDate: this.today(), installmentAmounts: "" });
                    this.showForm.set(false);
                    this.submitting.set(false);
                },
                error: () => this.submitting.set(false),
            });
    }

    protected lookup(): void {
        const id = this.lookupId().trim();
        if (!id) {
            return;
        }
        this.looking.set(true);
        this.invoiceApi.getById(id).subscribe({
            next: (invoice) => {
                this.lookedUpInvoice.set(invoice);
                this.looking.set(false);
            },
            error: () => {
                this.lookedUpInvoice.set(null);
                this.looking.set(false);
            },
        });
    }

    protected registerPayment(): void {
        const invoice = this.lookedUpInvoice();
        const installmentId = this.installmentId().trim();
        if (!invoice || !installmentId) {
            return;
        }
        this.invoiceApi.registerPayment(invoice.id, { installmentId, paidOn: this.paidOn() }).subscribe({
            next: (updated) => {
                this.lookedUpInvoice.set(updated);
                this.toast.success("Payment registered.");
            },
        });
    }

    protected cancel(): void {
        const invoice = this.lookedUpInvoice();
        if (!invoice || !confirm("Cancel this invoice?")) {
            return;
        }
        this.invoiceApi.cancel(invoice.id).subscribe({
            next: (updated) => {
                this.lookedUpInvoice.set(updated);
                this.toast.success("Invoice canceled.");
            },
        });
    }

    private today(): string {
        return new Date().toISOString().slice(0, 10);
    }
}
