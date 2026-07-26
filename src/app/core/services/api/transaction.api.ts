import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CreateTransactionRequest, TransactionDto, TransferFundsRequest } from "../../models/accounting.model";

@Injectable({ providedIn: "root" })
export class TransactionApi {
    constructor(private readonly http: HttpClient) {}

    record(request: CreateTransactionRequest): Observable<TransactionDto> {
        return this.http.post<TransactionDto>(`${environment.apiUrl}/transactions`, request);
    }

    transfer(request: TransferFundsRequest): Observable<void> {
        return this.http.post<void>(`${environment.apiUrl}/transfers`, request);
    }
}
