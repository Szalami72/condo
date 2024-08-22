import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../constans/constans';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  private saveFileApi = API_BASE_URL + 'files/savefile.php';

  constructor( private http: HttpClient) { }

  saveFile(file: any): Observable<any> {
    return this.http.post(this.saveFileApi, file);
  }
}
