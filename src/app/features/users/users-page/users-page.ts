import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { Role, UserDto } from "../../../core/models/identity.model";
import { UserApi } from "../../../core/services/api/user.api";
import { ToastService } from "../../../core/services/toast.service";
import { TranslationService } from "../../../core/services/translation.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";

@Component({
    selector: "app-users-page",
    imports: [ReactiveFormsModule, EmptyState, TranslatePipe],
    templateUrl: "./users-page.html",
    styleUrl: "./users-page.scss",
})
export class UsersPage {
    private readonly fb = inject(FormBuilder);
    private readonly userApi = inject(UserApi);
    private readonly toast = inject(ToastService);
    protected readonly i18n = inject(TranslationService);

    protected readonly roles: Role[] = ["DEVELOPER", "ADMINISTRATOR", "MANAGER", "COLLABORATOR"];
    protected readonly registeredUsers = signal<UserDto[]>([]);
    protected readonly submitting = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        fullName: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
    });

    protected readonly grantUserId = signal("");
    protected readonly grantRole = signal<Role>("COLLABORATOR");

    protected register(): void {
        if (this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.userApi
            .register(this.form.getRawValue())
            .pipe(finalize(() => this.submitting.set(false)))
            .subscribe({
                next: (user) => {
                    this.registeredUsers.update((users) => [user, ...users]);
                    this.toast.success(this.i18n.t("users.toastRegistered", { name: user.fullName }));
                    this.form.reset();
                },
                error: () => {
                    // error toast is raised globally by the HTTP error interceptor
                },
            });
    }

    protected grantRoleToUser(): void {
        const userId = this.grantUserId().trim();
        if (!userId) {
            return;
        }
        this.userApi.grantRole(userId, { role: this.grantRole() }).subscribe({
            next: (user) => {
                this.registeredUsers.update((users) => users.map((u) => (u.id === user.id ? user : u)));
                this.toast.success(
                    this.i18n.t("users.toastRoleGranted", {
                        role: this.i18n.t(`enums.role.${this.grantRole()}`),
                        name: user.fullName,
                    }),
                );
            },
        });
    }

    protected deactivate(user: UserDto): void {
        if (!confirm(this.i18n.t("users.confirmDeactivate", { name: user.fullName }))) {
            return;
        }
        this.userApi.deactivate(user.id).subscribe({
            next: (updated) => {
                this.registeredUsers.update((users) => users.map((u) => (u.id === updated.id ? updated : u)));
                this.toast.success(this.i18n.t("users.toastDeactivated", { name: user.fullName }));
            },
        });
    }
}
