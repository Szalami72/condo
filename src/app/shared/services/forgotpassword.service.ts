import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../constans/constans';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {

  private checkEmailApi = API_BASE_URL + 'auth/forgotpassword.php';
  private checkTokenApi = API_BASE_URL + 'auth/checktoken.php';
  private saveNewPasswordApi = API_BASE_URL + 'auth/savenewpassword.php';


  constructor(private http: HttpClient) { }

  checkAndSendEmail(email: string): Observable<any> {
    const body = { email };
    return this.http.post<any>(this.checkEmailApi, body);
  }

  checkToken(token: string): Observable<any> {
    const body = { token };
    return this.http.post<any>(this.checkTokenApi, body);
  }

  saveNewPassword(token: string, newPassword: string): Observable<any> {
    const body = { token, newPassword };
    return this.http.post<any>(this.saveNewPasswordApi, body);
  }
}
