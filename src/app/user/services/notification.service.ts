import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private newBulletinSubject = new BehaviorSubject<boolean>(false);
  newBulletin$ = this.newBulletinSubject.asObservable();

  constructor() {}

  setNewBulletinStatus(status: boolean): void {
    this.newBulletinSubject.next(status);
  }
}

