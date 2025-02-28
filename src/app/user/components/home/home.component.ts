import { Component, OnInit,  } from '@angular/core';
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
  isVotesVisible: boolean = true;

  lastLoginTime: Date | null = null;
  lastVisitedTime: Date | null = null;

  userId: number | null = null;

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
    if (!this.lastVisitedTime) return true;  // Első belépés, minden bejegyzés új
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
    return null;0
  }

  private getVotes(): void {
    if (!this.userId) {
      console.error("User ID is missing");
      return;
    }
  
    const questionId = this.votes.length > 0 ? this.votes[0].question_id : 0; // Ellenőrizzük, hogy van-e adat, ha nincs, alapértelmezett nullát adunk
  
    this.voteService.getVotes(this.userId, questionId).subscribe({
      next: (response) => {
        // Csak az "open" státuszú szavazásokat tároljuk el
        this.votes = response.data.filter((vote: { status: string; }) => vote.status === 'open');
        
        // Ellenőrizzük, hogy van-e legalább egy "open" státuszú szavazás
        this.hasOpenVote = this.votes.length > 0;
  
        if (this.hasOpenVote) {
          console.log('Van nyitott szavazás!', this.votes);
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
  
  


openVote(): void {
  this.isVotesVisible = !this.isVotesVisible;
}

}
