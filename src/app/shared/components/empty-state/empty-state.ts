import { Component, input } from "@angular/core";

@Component({
    selector: "app-empty-state",
    templateUrl: "./empty-state.html",
})
export class EmptyState {
    readonly title = input.required<string>();
    readonly description = input<string>("");
}
