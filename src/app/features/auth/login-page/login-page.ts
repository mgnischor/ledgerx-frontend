import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";

@Component({
    selector: "app-login-page",
    imports: [ReactiveFormsModule],
    templateUrl: "./login-page.html",
    styleUrl: "./login-page.scss",
})
export class LoginPage {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);

    protected readonly submitting = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required]],
    });

    protected async submit(): Promise<void> {
        if (this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        try {
            await this.authService.login(this.form.getRawValue());
            this.toast.success("Welcome back.");
            await this.router.navigateByUrl("/");
        } catch {
            // error toast is raised globally by the HTTP error interceptor
        } finally {
            this.submitting.set(false);
        }
    }
}
