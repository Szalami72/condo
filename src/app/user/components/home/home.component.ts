import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MenuComponent } from '../menu/menu.component';
import { BboardService } from '../../../admin/services/bboard.service';
import { MessageService } from '../../../shared/services/message.service';
import { ResidentsService } from '../../../admin/services/residents.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  bulletinBoards: any[] = [];
  lastLoginTime: Date | null = null;
  lastVisitedTime: Date | null = null; // Utolsó oldalmegtekintés

  constructor(
    private cookieService: CookieService,
    private messageService: MessageService,
    private bboardService: BboardService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private residentsService: ResidentsService
  ) {}

  ngOnInit(): void {
    this.loadLastVisitedTime();
    this.loadData();
  }

  private loadLastVisitedTime(): void {
    const storedTime = localStorage.getItem('lastVisitedTime');
    if (storedTime) {
      this.lastVisitedTime = new Date(storedTime);
    }
  }

  private saveLastVisitedTime(): void {
    const now = new Date();
    localStorage.setItem('lastVisitedTime', now.toISOString());
  }

  private loadData(): void {
    const currentUser = this.getCurrentUserDatas();
    if (currentUser) {
      this.getLoginHistory(currentUser.id);
    }
    this.getPreviousBbs();
    this.saveLastVisitedTime();
  }

  private getPreviousBbs(): void {
    this.bboardService.getPreviousBbs().subscribe({
      next: (response) => {
        this.bulletinBoards = response.data;
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba az adatok betöltése során. Próbáld meg később!');
        console.log(error);
      }
    });
  }

  private getLoginHistory(id: any): void {
    this.residentsService.getLoginHistory(id).subscribe({
      next: (response) => {
        console.log('response:', response);
        if (response.data.length > 0) {
          this.lastLoginTime = new Date(
            response.data.length > 1 ? response.data[1].loginTime : response.data[0].loginTime
          );
        }
        console.log('lastLoginTime:', this.lastLoginTime);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  isNewBulletin(createdAt: string): boolean {
    if (!this.lastVisitedTime) return false;
    return new Date(createdAt) > this.lastVisitedTime;
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    console.log('Felhasználói adatok törölve.');
    this.router.navigate(['/login']);
  }

  private getCurrentUserDatas(): any {
    let currentUserData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return currentUserData ? JSON.parse(currentUserData) : null;
  }
}
