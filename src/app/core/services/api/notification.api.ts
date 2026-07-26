import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { NotificationDto } from "../../models/notification.model";

@Injectable({ providedIn: "root" })
export class NotificationApi {
    private readonly baseUrl = `${environment.apiUrl}/notifications`;

    constructor(private readonly http: HttpClient) {}

    list(unreadOnly = false): Observable<NotificationDto[]> {
        return this.http.get<NotificationDto[]>(this.baseUrl, { params: { unreadOnly } });
    }

    markAsRead(notificationId: string): Observable<NotificationDto> {
        return this.http.patch<NotificationDto>(`${this.baseUrl}/${notificationId}/read`, {});
    }
}
