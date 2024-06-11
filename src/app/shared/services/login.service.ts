import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../constans/constans';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private loginApi = API_BASE_URL + 'login.php';

  constructor(private http: HttpClient) { }

  getUserData(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(this.loginApi, body);
  }
}
