import { DatePipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Subject, catchError, finalize, map, of, switchMap } from "rxjs";
import { DeveloperInfoDto } from "../../../core/models/developer.model";
import { DeveloperApi } from "../../../core/services/api/developer.api";
import { TranslationService } from "../../../core/services/translation.service";
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";

interface DebugHeaders {
    requestId: string | null;
    durationMs: string | null;
}

@Component({
    selector: "app-developer-page",
    imports: [TranslatePipe, DatePipe],
    templateUrl: "./developer-page.html",
    styleUrl: "./developer-page.scss",
})
export class DeveloperPage {
    private readonly developerApi = inject(DeveloperApi);
    protected readonly i18n = inject(TranslationService);

    private readonly reload$ = new Subject<void>();

    protected readonly loading = signal(false);
    protected readonly errored = signal(false);
    protected readonly headers = signal<DebugHeaders | null>(null);

    protected readonly info = toSignal(
        this.reload$.pipe(
            switchMap(() => {
                this.loading.set(true);
                this.errored.set(false);
                return this.developerApi.info().pipe(
                    map((response) => {
                        this.headers.set({
                            requestId: response.headers.get("X-Debug-Request-Id"),
                            durationMs: response.headers.get("X-Debug-Duration-Ms"),
                        });
                        return response.body;
                    }),
                    catchError(() => {
                        this.errored.set(true);
                        this.headers.set(null);
                        return of(null);
                    }),
                    finalize(() => this.loading.set(false)),
                );
            }),
        ),
        { initialValue: null as DeveloperInfoDto | null },
    );

    constructor() {
        this.reload$.next();
    }

    protected refresh(): void {
        this.reload$.next();
    }

    protected formatUptime(uptimeMillis: number): string {
        const totalSeconds = Math.floor(uptimeMillis / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    protected formatBytes(bytes: number): string {
        if (bytes < 0) {
            return this.i18n.t("developer.notAvailable");
        }
        if (bytes === 0) {
            return "0 B";
        }
        const units = ["B", "KB", "MB", "GB", "TB"];
        const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        const value = bytes / 1024 ** exponent;
        return `${value.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`;
    }

    protected formatPercentage(value: number | null): string {
        return value === null ? this.i18n.t("developer.notAvailable") : `${value.toFixed(1)}%`;
    }

    protected formatLoadAverage(value: number): string {
        return value < 0 ? this.i18n.t("developer.notAvailable") : value.toFixed(2);
    }

    protected isUnavailable(version: string): boolean {
        return version.startsWith("unavailable");
    }
}
