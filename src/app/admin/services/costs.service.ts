import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../constans/constans';


@Injectable({
  providedIn: 'root'
})
export class CostsService {

  private saveCostApi = API_BASE_URL + 'settings/savecosts.php';
  private getCostApi = API_BASE_URL + 'settings/getcosts.php';

  constructor(private http: HttpClient) { }

  saveCosts(costs: any): Observable<any> {
    return this.http.post(this.saveCostApi, costs);
  }

  getCosts(): Observable<any> {
    return this.http.get(this.getCostApi);
  }
}
