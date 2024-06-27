import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


import { API_BASE_URL } from '../../constans/constans';

@Injectable({
  providedIn: 'root'
})

export class DatasService {

  private saveDatasApi = API_BASE_URL + 'settings/savedatas.php';
  private getDatasApi = API_BASE_URL + 'settings/getdatas.php';

  constructor(private http: HttpClient) { }

  getDatas(): Observable<any> {
    return this.http.get<any>(this.getDatasApi).pipe(
      map(response => {
        if (response && response.status === 'success') {
          return response.data;
        } else {
          throw new Error('Sikertelen adatkérés vagy hiányzó adatok.');
        }
      }),
      catchError(error => {
        console.error('Error loading datas:', error);
        throw new Error('Sikertelen adatkérés vagy hiányzó adatok.');
      })
    );
  }

  saveDatas(datas: { id: number, title: string, data: string, isEditable: boolean }[]): Observable<any> {
    return this.http.post(this.saveDatasApi, datas);
  }
  
}
