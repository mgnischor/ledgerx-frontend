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

    success(message: string): void {
        this.push("success", message);
    }

    error(message: string): void {
        this.push("error", message);
    }

    info(message: string): void {
        this.push("info", message);
    }

    dismiss(id: number): void {
        this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
    }

    private push(kind: ToastKind, message: string): void {
        const id = this.nextId++;
        this.toasts.update((toasts) => [...toasts, { id, kind, message }]);
        timer(5000).subscribe(() => this.dismiss(id));
    }
}
