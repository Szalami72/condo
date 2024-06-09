import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginApi = 'http://localhost/condophp/loginapi.php';

  constructor(private http: HttpClient) { }

  getUserData(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(this.loginApi, body);
  }
}
