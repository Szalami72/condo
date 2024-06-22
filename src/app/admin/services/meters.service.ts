import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../constans/constans';

@Injectable({
  providedIn: 'root'
})
export class MetersService {

  private saveMetersApi = API_BASE_URL + 'settings/savemeters.php';
  private getMetersApi = API_BASE_URL + 'settings/getmeters.php';

  constructor(private http: HttpClient) { }


  saveMeters(cold1: boolean, cold2: boolean, hot1: boolean, hot2: boolean, heating: boolean): Observable<any> {
    const body = { cold1, cold2, hot1, hot2, heating };
    return this.http.post(this.saveMetersApi, body);
  }

  getMeters(): Observable<{ cold1: boolean, cold2: boolean, hot1: boolean, hot2: boolean, heating: boolean }> {
    return this.http.get<any>(this.getMetersApi).pipe(
      map(response => {
        if (response.status === 'success') {
          return {
            cold1: response.data.cold1,
            cold2: response.data.cold2,
            hot1: response.data.hot1,
            hot2: response.data.hot2,
            heating: response.data.heating
          };
        } else {
          throw new Error('Sikertelen adatkérés.');
        }
      })
    );
  }


}
