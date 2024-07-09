import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../constans/constans';

@Injectable({
  providedIn: 'root'
})
export class ResidentsService {

  private getDataApi = API_BASE_URL + 'residents/getresidencedatas.php';

  private saveDataApi = API_BASE_URL + 'residents/saveresidencedata.php';

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

  getCommoncosts(): Observable<any> {
    return this.getData('Commoncosts');
  }

  getSubdeposits(): Observable<any> {
    return this.getData('Subdeposits');
  }
  getSquareMeters(): Observable<any> {
    return this.getData('Squaremeters');
  }
  
  saveData(data: any): Observable<any> {
    return this.http.post(this.saveDataApi, data);
  }
}
