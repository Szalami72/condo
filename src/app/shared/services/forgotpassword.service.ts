import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../constans/constans';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {

  private loginApi = API_BASE_URL + 'forgotpassword.php';

  constructor() { }
}
