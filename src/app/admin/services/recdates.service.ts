import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../constans/constans';


@Injectable({
  providedIn: 'root'
})
export class RecdatesService {

  private saveRecDatesApi = API_BASE_URL + 'saverecorddates.php';
  private getRecDatesApi = API_BASE_URL + 'getrecorddates.php';

  constructor(private http: HttpClient) { }

  saveRecordDates(startDay: any, endDay: any): Observable<any> {
    const body = { startDay, endDay };
    return this.http.post(this.saveRecDatesApi, body);
  }

  getRecordDates(): Observable<{ startDay: number, endDay: number }> {
    return this.http.get<any>(this.getRecDatesApi).pipe(
      map(response => {
        if (response.status === 'success') {
          return {
            startDay: Number(response.data.startDate),
            endDay: Number(response.data.endDate)
          };
        } else {
          throw new Error('Sikertelen adatkérés.');
        }
      })
    );
  }
}
