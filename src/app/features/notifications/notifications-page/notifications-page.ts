import { DatePipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Subject, switchMap } from "rxjs";
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
    private readonly reload$ = new Subject<void>();

    protected readonly unreadOnly = signal(false);

    protected readonly notifications = toSignal(
        this.reload$.pipe(switchMap(() => this.notificationApi.list(this.unreadOnly()))),
        { initialValue: [] as NotificationDto[] },
    );

    constructor() {
        this.reload$.next();
    }

    protected toggleUnreadOnly(): void {
        this.unreadOnly.update((value) => !value);
        this.reload$.next();
    }

    protected markAsRead(notification: NotificationDto): void {
        this.notificationApi.markAsRead(notification.id).subscribe(() => this.reload$.next());
    }
}
