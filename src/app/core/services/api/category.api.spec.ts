import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { CategoryDto, CreateCategoryRequest } from "../../models/accounting.model";
import { CategoryApi } from "./category.api";

describe("CategoryApi", () => {
    let api: CategoryApi;
    let httpMock: HttpTestingController;
    const companyId = "company-1";
    const baseUrl = `${environment.apiUrl}/companies/${companyId}/categories`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CategoryApi, provideHttpClient(), provideHttpClientTesting()],
        });
        api = TestBed.inject(CategoryApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("creates a category", () => {
        const request: CreateCategoryRequest = { name: "Rent", type: "EXPENSE" };
        const response: CategoryDto = { id: "cat-1", companyId, name: "Rent", type: "EXPENSE" };

        api.create(companyId, request).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(request);
        req.flush(response);
    });

    it("lists categories", () => {
        api.list(companyId).subscribe((res) => expect(res).toEqual([]));

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("GET");
        req.flush([]);
    });
});
