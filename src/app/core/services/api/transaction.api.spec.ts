import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { CreateTransactionRequest, TransactionDto, TransferFundsRequest } from "../../models/accounting.model";
import { TransactionApi } from "./transaction.api";

describe("TransactionApi", () => {
    let api: TransactionApi;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TransactionApi, provideHttpClient(), provideHttpClientTesting()],
        });
        api = TestBed.inject(TransactionApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("records a transaction", () => {
        const request: CreateTransactionRequest = {
            financialAccountId: "account-1",
            categoryId: "cat-1",
            type: "EXPENSE",
            amount: 50,
            occurredOn: "2026-08-02",
        };
        const response: TransactionDto = {
            id: "tx-1",
            financialAccountId: request.financialAccountId,
            categoryId: request.categoryId,
            type: request.type,
            amount: request.amount,
            currency: "BRL",
            occurredOn: request.occurredOn,
        };

        api.record(request).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(`${environment.apiUrl}/transactions`);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(request);
        req.flush(response);
    });

    it("transfers funds between accounts", () => {
        const request: TransferFundsRequest = { fromAccountId: "account-1", toAccountId: "account-2", amount: 100 };

        api.transfer(request).subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/transfers`);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(request);
        req.flush(null);
    });
});
