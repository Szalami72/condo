import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../constans/constans';

@Injectable({
  providedIn: 'root'
})
export class ResidentsService {

  private getDataApi = API_BASE_URL + 'residents/getresidentdatas.php';

  private saveDataApi = API_BASE_URL + 'residents/saveresidentdata.php';

  private updateDataApi = API_BASE_URL + 'residents/updateresidentdata.php';

  private getResidentsApi = API_BASE_URL + 'residents/getresidents.php';

  private getResidentByIdApi = API_BASE_URL + 'residents/getresidentbyid.php';

  private deleteResidentApi = API_BASE_URL + 'residents/deleteresident.php';

  private getUsedMetersApi = API_BASE_URL + 'residents/getusedmeters.php';

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

  updateData(data: any): Observable<any> {
    return this.http.post(this.updateDataApi, data);
  }

  getAllResidents(): Observable<any> {
    return this.http.get<any>(this.getResidentsApi);
  }

  getResidentDatasById(userId: number): Observable<any> {
    return this.http.post<any>(this.getResidentByIdApi, { id: userId });
}

  deleteResident(userId: number): Observable<any> {
    return this.http.post<any>(this.deleteResidentApi, { id: userId });
  }

  getUsedMeters(squareMeter: string): Observable<any> {
    return this.http.post<any>(this.getUsedMetersApi, { squareMeter: squareMeter });
  }
}
