import { Component, inject } from "@angular/core";
import { ToastService } from "../../../core/services/toast.service";
import { TranslatePipe } from "../../pipes/translate.pipe";

@Component({
    selector: "app-toast-container",
    imports: [TranslatePipe],
    templateUrl: "./toast-container.html",
    styleUrl: "./toast-container.scss",
})
export class ToastContainer {
    protected readonly toastService = inject(ToastService);
}
