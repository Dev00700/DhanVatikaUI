import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { CommonResDto } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class DropdownDataService {
  constructor(private api: ApiService) {}

getDropdownData<T>(apiUrl: string): Observable<T[]> {
    return this.api.get<T[]>(apiUrl);
  }
    // Generic POST method to get data by ID or any payload
 getDropdownDataByParam<T>(apiUrl: string, payload: any): Observable<CommonResDto<T[]>> {
  return this.api.post<CommonResDto<T[]>>(apiUrl, payload);
}

}