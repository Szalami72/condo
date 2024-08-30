import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../constans/constans';


@Injectable({
  providedIn: 'root'
})
export class RecdatesService {

  private saveRecDatesApi = API_BASE_URL + 'settings/saverecorddates.php';
  private getRecDatesApi = API_BASE_URL + 'settings/getrecorddates.php';

  constructor(private http: HttpClient) { }

  saveRecordDates(startDay: any, endDay: any, selectedPeriod: string): Observable<any> {
    const body = { startDay, endDay, selectedPeriod };
    return this.http.post(this.saveRecDatesApi, body);
  }

  getRecordDates(): Observable<{ startDay: number, endDay: number, selectedPeriod: string }> {
    return this.http.get<any>(this.getRecDatesApi).pipe(
      map(response => {
        if (response.status === 'success') {
          return {
            startDay: Number(response.data.startDate),
            endDay: Number(response.data.endDate),
            selectedPeriod: response.data.selectedPeriod
          };
        } else {
          throw new Error('Sikertelen adatkérés.');
        }
      })
    );
  }
}
