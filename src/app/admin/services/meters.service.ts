import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../constans/constans';

@Injectable({
  providedIn: 'root'
})
export class MetersService {

  private saveMetersApi = API_BASE_URL + 'settings/savemeters.php';
  private getMetersApi = API_BASE_URL + 'settings/getmeters.php';

  constructor(http: HttpClient) { }
}
