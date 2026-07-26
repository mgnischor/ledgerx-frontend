import { DatePipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { NotificationDto } from "../../../core/models/notification.model";
import { NotificationApi } from "../../../core/services/api/notification.api";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";

@Component({
    selector: "app-notifications-page",
    imports: [EmptyState, DatePipe],
    templateUrl: "./notifications-page.html",
    styleUrl: "./notifications-page.scss",
})
export class NotificationsPage {
    private readonly notificationApi = inject(NotificationApi);

    protected readonly notifications = signal<NotificationDto[]>([]);
    protected readonly unreadOnly = signal(false);
    protected readonly loading = signal(false);

    constructor() {
        this.load();
    }

    protected load(): void {
        this.loading.set(true);
        this.notificationApi.list(this.unreadOnly()).subscribe({
            next: (notifications) => {
                this.notifications.set(notifications);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    protected toggleUnreadOnly(): void {
        this.unreadOnly.update((value) => !value);
        this.load();
    }

    protected markAsRead(notification: NotificationDto): void {
        this.notificationApi.markAsRead(notification.id).subscribe({
            next: (updated) => {
                this.notifications.update((notifications) =>
                    notifications.map((n) => (n.id === updated.id ? updated : n)),
                );
            },
        });
    }
}
