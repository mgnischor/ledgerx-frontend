import { provideHttpClient, withInterceptors } from "@angular/common/http";
import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";

import { routes } from "./app.routes";
import { authInterceptor } from "./core/interceptors/auth.interceptor";
import { errorInterceptor } from "./core/interceptors/error.interceptor";
import { TranslationService } from "./core/services/translation.service";

/**
 * Root dependency-injection configuration passed to {@link bootstrapApplication}.
 *
 * Wires up the router (with component-input binding so route params/data can be bound directly to
 * component `input()`s), the HTTP client with the auth/error interceptors, and an app initializer
 * that awaits the active locale's translations before the first render.
 */
export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideAppInitializer(() => inject(TranslationService).load()),
    ],
};
