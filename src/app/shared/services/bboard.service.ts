import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../constans/constans';


@Injectable({
  providedIn: 'root'
})
export class BboardService {

  private getPreviousBbsApi = API_BASE_URL + 'bboard/getpreviousbbs.php';
  private saveBbApi = API_BASE_URL + 'bboard/savebb.php';
  private deleteBbApi = API_BASE_URL + 'bboard/deletebb.php';

  constructor(private http: HttpClient) { }


  getPreviousBbs(): Observable<any> {
    return this.http.get<any>(this.getPreviousBbsApi);
  }

  saveOrUpdateBb(bb: any, bbId: number, isFixed: boolean): Observable<any> {
    const body = { bb, bbId, isFixed };
    return this.http.post(this.saveBbApi, body);
  }

  deleteBb(bbId: number): Observable<any> {
    return this.http.post(this.deleteBbApi, { bbId });
  }
}
