import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../constans/constans';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  private saveFileApi = API_BASE_URL + 'files/savefile.php';
  private getFilesApi = API_BASE_URL + 'files/getfiles.php';
  private getFileByIdApi = API_BASE_URL + 'files/getfilebyid.php';
  private deleteFileApi = API_BASE_URL + 'files/deletefile.php';

  constructor( private http: HttpClient) { }

  saveFile(file: any): Observable<any> {
    return this.http.post(this.saveFileApi, file);
  }

  getFiles(): Observable<any> {
    return this.http.get(this.getFilesApi);
  }

  getFileById(id: number): Observable<any> {
    return this.http.get(this.getFileByIdApi + '?id=' + id);
  }

  deleteFile(id: number): Observable<any> {
    return this.http.post(this.deleteFileApi, { id: id });
  }
  

}
