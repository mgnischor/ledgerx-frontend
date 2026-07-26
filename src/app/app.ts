import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
<<<<<<< HEAD
import { ToastContainer } from "./shared/components/toast-container/toast-container";

@Component({
    selector: "app-root",
    imports: [RouterOutlet, ToastContainer],
=======

@Component({
    selector: "app-root",
    imports: [RouterOutlet],
>>>>>>> b6e24a135638ec3e2eaa2435f28761b87b3ba772
    templateUrl: "./app.html",
    styleUrl: "./app.scss",
})
export class App {}
