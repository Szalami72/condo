import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { VotesComponent } from '../votes/votes.component';
import { MenuComponent } from '../menu/menu.component';
import { BboardService } from '../../../admin/services/bboard.service';
import { MessageService } from '../../../shared/services/message.service';
import { ResidentsService } from '../../../admin/services/residents.service';
import { NotificationService } from '../../services/notification.service';
import { MenuService } from '../../services/menu.service';
import { VoteService } from '../../../admin/services/vote.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent, CommonModule, VotesComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  
  bulletinBoards: any[] = [];
  votes: any[] = [];
  hasOpenVote: boolean = false;
  hasExpiredVote: boolean = false;
  isVotesVisible: boolean = false;

  lastLoginTime: Date | null = null;
  lastVisitedTime: Date | null = null;

  userId: number | null = null;
  canViewResults: { [key: number]: boolean } = {}; 

  constructor(
    private messageService: MessageService,
    private bboardService: BboardService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private residentsService: ResidentsService,
    private notificationService: NotificationService,
    private menuService: MenuService,
    private voteService: VoteService
  ) {}

  async ngOnInit(): Promise<void> {
    const currentUser = this.getCurrentUserDatas();
    if (currentUser) {
      this.userId = currentUser.id;
      this.loadLastVisitedTime(currentUser.id);
      this.loadData(currentUser.id);
      this.getVotes();
    }
    await this.menuService.inicialize();
  }

  private getVotes(): void {
    if (!this.userId) {
      console.error("User ID is missing");
      return;
    }
  
    this.voteService.getVotes(this.userId, 0).subscribe({
      next: (response) => {
        const now = new Date();
        let hasActiveVote = false;
        let hasExpiredVote = false;
  
        this.votes = response.data.map((vote: any) => {
          const endDate = new Date(vote.end_date);
          const threeDaysAfterEnd = new Date(endDate);
          threeDaysAfterEnd.setDate(threeDaysAfterEnd.getDate() + 3);
  
          // Ellenőrizzük, hogy van-e aktív szavazás és lejárt szavazás
          if (vote.status === 'open' && now < endDate) {
            hasActiveVote = true; // Van aktív szavazás
          } else if (now > endDate && now <= threeDaysAfterEnd) {
            hasExpiredVote = true; // Van lejárt szavazás, de 3 napon belül
          }
  
          // Visszaadjuk a szavazást
          return vote;
        });
  
        // Beállítjuk, hogy mi jelenjen meg a UI-ban
        this.hasOpenVote = hasActiveVote;
        this.hasExpiredVote = hasExpiredVote;
  
      },
      error: (error) => {
        console.error("Hiba a szavazások lekérése során:", error);
      }
    });
  }
  

  private loadLastVisitedTime(userId: string): void {
    const storedTime = localStorage.getItem(`lastVisitedTime_home_${userId}`);
    this.lastVisitedTime = storedTime ? new Date(storedTime) : this.lastLoginTime || null;
  }

  private saveLastVisitedTime(userId: number): void {
    const now = new Date().toISOString();
    localStorage.setItem(`lastVisitedTime_home_${userId}`, now);
  }

  private loadData(userId: number): void {
    this.getLoginHistory(userId);
    this.getPreviousBbs();
    this.saveLastVisitedTime(userId);
  }

  private getPreviousBbs(): void {
    this.bboardService.getPreviousBbs().subscribe({
      next: (response) => {
        this.bulletinBoards = response.data.sort((a: any, b: any) => {
          if (a.isFixed !== b.isFixed) {
            return b.isFixed - a.isFixed;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        const hasNewBulletin = this.bulletinBoards.some(bulletin => this.isNewBulletin(bulletin.created_at));
        this.notificationService.setNewBulletinStatus(hasNewBulletin);
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba az adatok betöltése során. Próbáld meg később!');
        console.log(error);
      }
    });
  }

  private getLoginHistory(id: number): void {
    this.residentsService.getLoginHistory(id).subscribe({
      next: (response) => {
        this.lastLoginTime = response.data.length > 1 ? new Date(response.data[1].loginTime) : new Date('2024-01-01T00:00:00');
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  isNewBulletin(createdAt: string): boolean {
    if (!this.lastVisitedTime) return true;
    return new Date(createdAt) > this.lastVisitedTime;
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  private getCurrentUserDatas(): any {
    const currentUserData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUserData) {
      const parsedData = JSON.parse(currentUserData);
      parsedData.id = Number(parsedData.id);
      return parsedData;
    }
    return null;
  }

  openVote(): void {
    this.isVotesVisible = !this.isVotesVisible;

    const votesContent = document.querySelector('.votes-content') as HTMLElement;
    if (votesContent) {
        if (this.isVotesVisible) {
            // Ha megnyitjuk a szavazást, a max-height-et állítsuk be a tartalom magasságához.
            votesContent.style.maxHeight = `${votesContent.scrollHeight}px`;
        } else {
            // Ha bezárjuk, állítsuk vissza a max-height-et 0-ra.
            votesContent.style.maxHeight = '0';
        }
    }
}

}
