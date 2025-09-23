// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class outgoingpaymentservice {
    private apiUrl = 'OutgoingPayment/GetOutgoingPaymentListService';

    constructor(private http: ApiService) { }

    getoutgoingpayment(companyId: number, page: number, pageSize: number, userId: number, filters: any): Observable<any> {
        const body = {
            companyId,
            pageSize: page,          // API expects current page number
            pageRecordCount: pageSize,
            userId,
            data: filters            // send filters here
        };
        return this.http.post<any>(this.apiUrl, body);
    }
}
