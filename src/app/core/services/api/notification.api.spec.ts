import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { NotificationDto } from "../../models/notification.model";
import { NotificationApi } from "./notification.api";

describe("NotificationApi", () => {
    let api: NotificationApi;
    let httpMock: HttpTestingController;
    const baseUrl = `${environment.apiUrl}/notifications`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NotificationApi, provideHttpClient(), provideHttpClientTesting()],
        });
        api = TestBed.inject(NotificationApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("lists all notifications by default", () => {
        api.list().subscribe((res) => expect(res).toEqual([]));

        const req = httpMock.expectOne((r) => r.url === baseUrl);
        expect(req.request.method).toBe("GET");
        expect(req.request.params.get("unreadOnly")).toBe("false");
        req.flush([]);
    });

    it("lists only unread notifications when requested", () => {
        api.list(true).subscribe((res) => expect(res).toEqual([]));

        const req = httpMock.expectOne((r) => r.url === baseUrl);
        expect(req.request.params.get("unreadOnly")).toBe("true");
        req.flush([]);
    });

    it("marks a notification as read", () => {
        const response: NotificationDto = {
            id: "notif-1",
            type: "INVOICE_PAID",
            referenceId: "invoice-1",
            message: "Invoice paid",
            createdAt: "2026-08-02T00:00:00Z",
            read: true,
        };

        api.markAsRead("notif-1").subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(`${baseUrl}/notif-1/read`);
        expect(req.request.method).toBe("PATCH");
        expect(req.request.body).toEqual({});
        req.flush(response);
    });
});
