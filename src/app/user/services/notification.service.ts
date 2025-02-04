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

  constructor() {}

  setNewBulletinStatus(status: boolean): void {
    this.newBulletinSubject.next(status);
  }

  setEnableRecordStatus(status: boolean): void {
    this.enableRecordSubject.next(status);
  }
}
