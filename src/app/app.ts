import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ToastContainer } from "./shared/components/toast-container/toast-container";

/**
 * Application root component.
 *
 * Renders the active route through {@link RouterOutlet} and hosts the global
 * {@link ToastContainer} so any feature can surface a toast without wiring its own container.
 */
@Component({
    selector: "app-root",
    imports: [RouterOutlet, ToastContainer],
    templateUrl: "./app.html",
    styleUrl: "./app.scss",
})
export class App {}
