import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../constans/constans';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {

  private changePasswordApi = API_BASE_URL + 'auth/changepassword.php';



  constructor(private http: HttpClient) { }

  changePassword(userId: number, oldPassword: string, newPassword: string): Observable<any> {
    const body = { userId, oldPassword, newPassword };
    return this.http.post<any>(this.changePasswordApi, body);
  }
}

