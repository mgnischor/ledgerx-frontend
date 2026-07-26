import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Role, UserDto } from "../../../core/models/identity.model";
import { UserApi } from "../../../core/services/api/user.api";
import { ToastService } from "../../../core/services/toast.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";

@Component({
    selector: "app-users-page",
    imports: [ReactiveFormsModule, EmptyState],
    templateUrl: "./users-page.html",
    styleUrl: "./users-page.scss",
})
export class UsersPage {
    private readonly fb = inject(FormBuilder);
    private readonly userApi = inject(UserApi);
    private readonly toast = inject(ToastService);

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
        this.userApi.register(this.form.getRawValue()).subscribe({
            next: (user) => {
                this.registeredUsers.update((users) => [user, ...users]);
                this.toast.success(`${user.fullName} registered. Grant a role to enable access.`);
                this.form.reset();
                this.submitting.set(false);
            },
            error: () => this.submitting.set(false),
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
                this.toast.success(`${this.grantRole()} granted to ${user.fullName}.`);
            },
        });
    }

    protected deactivate(user: UserDto): void {
        if (!confirm(`Deactivate ${user.fullName}?`)) {
            return;
        }
        this.userApi.deactivate(user.id).subscribe({
            next: (updated) => {
                this.registeredUsers.update((users) => users.map((u) => (u.id === updated.id ? updated : u)));
                this.toast.success(`${user.fullName} deactivated.`);
            },
        });
    }
}
