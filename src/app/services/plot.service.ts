import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class plotservice {
    private apiUrl = 'Plot/GetPlotListService';

    constructor(private http: ApiService) { }

    getplotlist(companyId: number, page: number, pageSize: number, userId: number, filters: any): Observable<any> {
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
