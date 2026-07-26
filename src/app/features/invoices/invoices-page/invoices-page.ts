import { Component, inject, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Subject, catchError, finalize, of, switchMap } from "rxjs";
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

    private readonly lookup$ = new Subject<string>();

    protected readonly directions: PartyType[] = ["CUSTOMER", "SUPPLIER"];
    protected readonly issuedInvoices = signal<InvoiceDto[]>([]);
    protected readonly submitting = signal(false);
    protected readonly showForm = signal(false);

    protected readonly lookupId = signal("");
    protected readonly looking = signal(false);
    protected readonly installmentId = signal("");
    protected readonly paidOn = signal(this.today());

    protected readonly form = this.fb.nonNullable.group({
        partyId: ["", [Validators.required]],
        direction: ["CUSTOMER" as PartyType, [Validators.required]],
        firstDueDate: [this.today(), [Validators.required]],
        installmentAmounts: ["", [Validators.required]],
    });

    protected readonly parties = toSignal(
        toObservable(this.companyContext.selectedCompany).pipe(
            switchMap((company) => (company ? this.partyApi.list(company.id) : of([]))),
        ),
        { initialValue: [] as PartyDto[] },
    );

    protected readonly lookedUpInvoice = toSignal(
        this.lookup$.pipe(
            switchMap((id) => {
                this.looking.set(true);
                return this.invoiceApi.getById(id).pipe(
                    catchError(() => of(null)),
                    finalize(() => this.looking.set(false)),
                );
            }),
        ),
        { initialValue: null as InvoiceDto | null },
    );

    constructor() {
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
            .pipe(finalize(() => this.submitting.set(false)))
            .subscribe({
                next: (invoice) => {
                    this.issuedInvoices.update((invoices) => [invoice, ...invoices]);
                    this.toast.success(`Invoice issued with ${invoice.installmentCount} installment(s).`);
                    this.form.reset({ direction: "CUSTOMER", firstDueDate: this.today(), installmentAmounts: "" });
                    this.showForm.set(false);
                },
                error: () => {
                    // error toast is raised globally by the HTTP error interceptor
                },
            });
    }

    protected lookup(): void {
        const id = this.lookupId().trim();
        if (id) {
            this.lookup$.next(id);
        }
    }

    protected registerPayment(): void {
        const invoice = this.lookedUpInvoice();
        const installmentId = this.installmentId().trim();
        if (!invoice || !installmentId) {
            return;
        }
        this.invoiceApi.registerPayment(invoice.id, { installmentId, paidOn: this.paidOn() }).subscribe({
            next: () => {
                this.toast.success("Payment registered.");
                this.lookup$.next(invoice.id);
            },
        });
    }

    protected cancel(): void {
        const invoice = this.lookedUpInvoice();
        if (!invoice || !confirm("Cancel this invoice?")) {
            return;
        }
        this.invoiceApi.cancel(invoice.id).subscribe({
            next: () => {
                this.toast.success("Invoice canceled.");
                this.lookup$.next(invoice.id);
            },
        });
    }

    private today(): string {
        return new Date().toISOString().slice(0, 10);
    }
}
