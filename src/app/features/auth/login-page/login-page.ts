import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { finalize } from "rxjs";
import { AuthService } from "../../../core/services/auth.service";
import { TranslationService } from "../../../core/services/translation.service";
import { ToastService } from "../../../core/services/toast.service";
import { LanguageSwitcher } from "../../../shared/components/language-switcher/language-switcher";
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";

@Component({
    selector: "app-login-page",
    imports: [ReactiveFormsModule, TranslatePipe, LanguageSwitcher],
    templateUrl: "./login-page.html",
    styleUrl: "./login-page.scss",
})
export class LoginPage {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);
    protected readonly i18n = inject(TranslationService);

    protected readonly submitting = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required]],
    });

    protected submit(): void {
        if (this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.authService
            .login(this.form.getRawValue())
            .pipe(finalize(() => this.submitting.set(false)))
            .subscribe({
                next: () => {
                    this.toast.success(this.i18n.t("auth.toastWelcomeBack"));
                    this.router.navigateByUrl("/");
                },
                error: () => {
                    // error toast is raised globally by the HTTP error interceptor
                },
            });
    }
}
