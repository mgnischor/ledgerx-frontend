import { Injectable, signal } from "@angular/core";
import { timer } from "rxjs";

export type ToastKind = "success" | "error" | "info";

export interface Toast {
    id: number;
    kind: ToastKind;
    message: string;
}

@Injectable({ providedIn: "root" })
export class ToastService {
    private nextId = 0;
    readonly toasts = signal<Toast[]>([]);

    /**
     * Shows a success toast that dismisses itself after five seconds.
     *
     * @param message the message to display
     */
    success(message: string): void {
        this.push("success", message);
    }

    /**
     * Shows an error toast that dismisses itself after five seconds.
     *
     * @param message the message to display
     */
    error(message: string): void {
        this.push("error", message);
    }

    /**
     * Shows an informational toast that dismisses itself after five seconds.
     *
     * @param message the message to display
     */
    info(message: string): void {
        this.push("info", message);
    }

    /**
     * Removes a toast from the container immediately.
     *
     * @param id the id of the toast to remove
     */
    dismiss(id: number): void {
        this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
    }

    /**
     * Appends a new toast and schedules its auto-dismissal.
     *
     * @param kind    the toast's visual style
     * @param message the message to display
     */
    private push(kind: ToastKind, message: string): void {
        const id = this.nextId++;
        this.toasts.update((toasts) => [...toasts, { id, kind, message }]);
        timer(5000).subscribe(() => this.dismiss(id));
    }
}
