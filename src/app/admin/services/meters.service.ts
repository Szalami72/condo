import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { API_BASE_URL } from '../../constans/constans';

@Injectable({
  providedIn: 'root'
})
export class MetersService {

  private saveMetersApi = API_BASE_URL + 'settings/savemeters.php';
  private getMetersApi = API_BASE_URL + 'settings/getmeters.php';

  private getMetersValuesApi = API_BASE_URL + 'meters/getmetersvalues.php';

  constructor(private http: HttpClient) { }

  saveMeters(metersData: { cold1: boolean, cold2: boolean, hot1: boolean, hot2: boolean, heating: boolean }): Observable<any> {
    return this.http.post(this.saveMetersApi, metersData);
  }

  getMeters(): Observable<any> {
    return this.http.get<any>(this.getMetersApi).pipe(
      map(response => {
        if (response && response.status === 'success' && response.data) {
          return {
            cold1: response.data.cold1 || false,
            cold2: response.data.cold2 || false,
            hot1: response.data.hot1 || false,
            hot2: response.data.hot2 || false,
            heating: response.data.heating || false
          };
        } else {
          throw new Error('Sikertelen adatkérés vagy hiányzó adatok.');
        }
      }),
      catchError(error => {
        throw new Error('Sikertelen adatkérés vagy hiányzó adatok.');
      })
    );
  }

  getMetersValues(monthAndYear: string): Observable<any> {
    return this.http.post<any>(this.getMetersValuesApi, { monthAndYear: monthAndYear });
}

}
