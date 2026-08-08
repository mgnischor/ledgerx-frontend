import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CreateTransactionRequest, TransactionDto, TransferFundsRequest } from "../../models/accounting.model";

/** HTTP client for the `accounting` context's transaction endpoints. */
@Injectable({ providedIn: "root" })
export class TransactionApi {
    /** @param http the Angular HTTP client used to issue requests */
    constructor(private readonly http: HttpClient) {}

    /**
     * Records a single income or expense movement on a financial account.
     *
     * @param request the transaction data to record
     * @returns an observable emitting the recorded transaction
     */
    record(request: CreateTransactionRequest): Observable<TransactionDto> {
        return this.http.post<TransactionDto>(`${environment.apiUrl}/transactions`, request);
    }

    /**
     * Moves funds atomically from one account to another.
     *
     * @param request the transfer data
     * @returns an observable that completes once the transfer was processed
     */
    transfer(request: TransferFundsRequest): Observable<void> {
        return this.http.post<void>(`${environment.apiUrl}/transfers`, request);
    }
}
