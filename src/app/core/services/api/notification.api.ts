import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { NotificationDto } from "../../models/notification.model";

/** HTTP client for the platform's notification endpoints. */
@Injectable({ providedIn: "root" })
export class NotificationApi {
    private readonly baseUrl = `${environment.apiUrl}/notifications`;

    /** @param http the Angular HTTP client used to issue requests */
    constructor(private readonly http: HttpClient) {}

    /**
     * Lists the current user's notifications, optionally restricted to unread ones.
     *
     * @param unreadOnly when `true`, only unread notifications are returned
     * @returns an observable emitting the matching notifications
     */
    list(unreadOnly = false): Observable<NotificationDto[]> {
        return this.http.get<NotificationDto[]>(this.baseUrl, { params: { unreadOnly } });
    }

    /**
     * Marks a notification as read; idempotent on the backend.
     *
     * @param notificationId the notification's id
     * @returns an observable emitting the updated notification
     */
    markAsRead(notificationId: string): Observable<NotificationDto> {
        return this.http.patch<NotificationDto>(`${this.baseUrl}/${notificationId}/read`, {});
    }
}
