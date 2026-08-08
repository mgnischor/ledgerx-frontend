import { DatePipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Subject, switchMap } from "rxjs";
import { NotificationDto } from "../../../core/models/notification.model";
import { NotificationApi } from "../../../core/services/api/notification.api";
import { TranslationService } from "../../../core/services/translation.service";
import { EmptyState } from "../../../shared/components/empty-state/empty-state";
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";

@Component({
    selector: "app-notifications-page",
    imports: [EmptyState, DatePipe, TranslatePipe],
    templateUrl: "./notifications-page.html",
    styleUrl: "./notifications-page.scss",
})
export class NotificationsPage {
    private readonly notificationApi = inject(NotificationApi);
    protected readonly i18n = inject(TranslationService);
    private readonly reload$ = new Subject<void>();

    protected readonly unreadOnly = signal(false);

    /** The current user's notifications, reloaded on demand and optionally restricted to unread ones. */
    protected readonly notifications = toSignal(
        this.reload$.pipe(switchMap(() => this.notificationApi.list(this.unreadOnly()))),
        { initialValue: [] as NotificationDto[] },
    );

    /** Loads the notification list when the page is constructed. */
    constructor() {
        this.reload$.next();
    }

    /** Toggles the unread-only filter and reloads the notification list. */
    protected toggleUnreadOnly(): void {
        this.unreadOnly.update((value) => !value);
        this.reload$.next();
    }

    /**
     * Marks a notification as read and reloads the list.
     *
     * @param notification the notification to mark as read
     */
    protected markAsRead(notification: NotificationDto): void {
        this.notificationApi.markAsRead(notification.id).subscribe(() => this.reload$.next());
    }
}
