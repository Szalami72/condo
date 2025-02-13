import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private newBulletinSubject = new BehaviorSubject<boolean>(false);
  newBulletin$ = this.newBulletinSubject.asObservable();

  private enableRecordSubject = new BehaviorSubject<boolean>(false);
  enableRecord$ = this.enableRecordSubject.asObservable();

  private newFileSubject = new BehaviorSubject<boolean>(false);
  newFile$ = this.newFileSubject.asObservable();

  constructor() {}

  setNewBulletinStatus(status: boolean): void {
    this.newBulletinSubject.next(status);
  }

  setEnableRecordStatus(status: boolean): void {
    this.enableRecordSubject.next(status);
  }

  setNewFileStatus(status: boolean): void {
    this.newFileSubject.next(status);
  }

}
