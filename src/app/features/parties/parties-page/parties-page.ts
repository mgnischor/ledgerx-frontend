import { Component, inject, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Subject, finalize, merge, of, switchMap } from "rxjs";
import { DocumentType, PartyDto, PartyType } from "../../../core/models/billing.model";
import { PartyApi } from "../../../core/services/api/party.api";
import { CompanyContextService } from "../../../core/services/company-context.service";
import { ToastService } from "../../../core/services/toast.service";
import { TranslationService } from "../../../core/services/translation.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";

@Component({
    selector: "app-parties-page",
    imports: [ReactiveFormsModule, RouterLink, EmptyState, TranslatePipe],
    templateUrl: "./parties-page.html",
    styleUrl: "./parties-page.scss",
})
export class PartiesPage {
    private readonly fb = inject(FormBuilder);
    private readonly partyApi = inject(PartyApi);
    private readonly toast = inject(ToastService);
    protected readonly companyContext = inject(CompanyContextService);
    protected readonly i18n = inject(TranslationService);

    private readonly reload$ = new Subject<void>();

    protected readonly documentTypes: DocumentType[] = ["CPF", "CNPJ"];
    protected readonly partyTypes: PartyType[] = ["CUSTOMER", "SUPPLIER"];
    protected readonly submitting = signal(false);
    protected readonly showForm = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        name: ["", [Validators.required, Validators.maxLength(150)]],
        documentType: ["CNPJ" as DocumentType, [Validators.required]],
        document: ["", [Validators.required]],
        email: ["", [Validators.required, Validators.email]],
        type: ["CUSTOMER" as PartyType, [Validators.required]],
    });

    /** The company's parties, reloaded when the selected company changes or the list is re-requested. */
    protected readonly parties = toSignal(
        merge(toObservable(this.companyContext.selectedCompany), this.reload$).pipe(
            switchMap(() => {
                const company = this.companyContext.selectedCompany();
                return company ? this.partyApi.list(company.id) : of([]);
            }),
        ),
        { initialValue: [] as PartyDto[] },
    );

    /**
     * Submits the party form and creates the party for the currently selected company.
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
        this.partyApi
            .create(company.id, this.form.getRawValue())
            .pipe(finalize(() => this.submitting.set(false)))
            .subscribe({
                next: (party) => {
                    this.toast.success(this.i18n.t("parties.toastCreated", { name: party.name }));
                    this.form.reset({ documentType: "CNPJ", type: "CUSTOMER" });
                    this.showForm.set(false);
                    this.reload$.next();
                },
                error: () => {
                    // error toast is raised globally by the HTTP error interceptor
                },
            });
    }
}
