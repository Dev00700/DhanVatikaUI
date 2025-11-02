import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class locationservice {
    private apiUrl = 'Location/GetLocationListService';

    constructor(private http: ApiService) { }

    getLocationList(companyId: number, page: number, pageSize: number, userId: number, filters: any): Observable<any> {
        const body = {
            companyId,
            pageSize: page,
            pageRecordCount: pageSize,
            userId,
            data: filters
        };
        return this.http.post<any>(this.apiUrl, body);
    }
}
