import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../constans/constans';

@Injectable({
  providedIn: 'root'
})
export class ResidentsService {

  private getDataApi = API_BASE_URL + 'residents/getresidencedatas.php';

  constructor(private http: HttpClient) { }

  getData(action: string): Observable<any> {
    const url = `${this.getDataApi}?action=${action}`;
    return this.http.get<any>(url);
  }

  getBuildings(): Observable<any> {
    return this.getData('Buildings');
  }

  getFloors(): Observable<any> {
    return this.getData('Floors');
  }

  getDoors(): Observable<any> {
    return this.getData('Doors');
  }
}
