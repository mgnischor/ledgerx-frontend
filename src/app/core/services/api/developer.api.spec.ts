import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { DeveloperInfoDto } from "../../models/developer.model";
import { DeveloperApi } from "./developer.api";

describe("DeveloperApi", () => {
    let api: DeveloperApi;
    let httpMock: HttpTestingController;
    const baseUrl = `${environment.apiUrl}/developer`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DeveloperApi, provideHttpClient(), provideHttpClientTesting()],
        });
        api = TestBed.inject(DeveloperApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("requests the full response including debug trace headers", () => {
        const body: DeveloperInfoDto = {
            application: { name: "ledgerx-backend", activeProfiles: ["dev"], serverTime: "2026-08-02T00:00:00Z" },
            operatingSystem: { name: "Linux", version: "6.0", architecture: "amd64", hostName: "host" },
            cpu: {
                architecture: "amd64",
                availableProcessors: 4,
                systemLoadAverage: 0.5,
                systemCpuLoadPercentage: 10,
                processCpuLoadPercentage: 5,
            },
            memory: {
                jvmUsedBytes: 1,
                jvmMaxBytes: 2,
                jvmFreeBytes: 1,
                systemTotalBytes: 4,
                systemFreeBytes: 2,
                systemUsedBytes: 2,
            },
            storage: { path: "/", totalBytes: 100, usableBytes: 50, usedBytes: 50 },
            services: { rabbitMq: "3.13", postgreSql: "16", grafana: "11" },
            javaRuntime: {
                vendor: "Eclipse Adoptium",
                version: "21",
                vmName: "OpenJDK",
                vmVersion: "21",
                javaHome: "/opt/java",
                pid: 1,
                startTime: "2026-08-02T00:00:00Z",
                uptimeMillis: 1000,
            },
        };

        api.info().subscribe((res) => {
            expect(res.body).toEqual(body);
            expect(res.headers.get("X-Debug-Request-Id")).toBe("req-123");
            expect(res.headers.get("X-Debug-Duration-Ms")).toBe("42");
        });

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("GET");
        req.flush(body, { headers: { "X-Debug-Request-Id": "req-123", "X-Debug-Duration-Ms": "42" } });
    });
});
