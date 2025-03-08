import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MenuComponent } from "../menu/menu.component";
import { VoteService } from '../../services/vote.service';
import { FormsModule } from '@angular/forms';
import { MessageComponent } from '../../../shared/sharedcomponents/message/message.component';
import { MessageService } from '../../../shared/services/message.service';
import { ConfirmmodalComponent } from '../../../shared/sharedcomponents/confirmmodal/confirmmodal.component';
import { InfomodalComponent } from '../../../shared/sharedcomponents/infomodal/infomodal.component';
import { DescriptionService } from '../../services/description.service';
@Component({
  selector: 'app-vote',
  standalone: true,
  imports: [MenuComponent, MessageComponent, CommonModule, FormsModule],
  templateUrl: './vote.component.html',
  styleUrl: './vote.component.css'
})
export class VoteComponent implements OnInit {

  previousVotes: any[] = [];
  poll = {
    question: '',
    end_date: '',
    answers: [{ answerText: '' }]  // Kezdetben egy üres válasz
  };

  constructor(private voteService: VoteService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal,
    private descriptionService: DescriptionService
  ) { }

  ngOnInit(): void {
    this.getPreviousVotes();
  }  


  getPreviousVotes() {
    
  
    this.voteService.getVotes(0,0).subscribe(
      data => {
        this.previousVotes = data.data;
        // console.log('prevvotes', this.previousVotes);
      },
      error => {
        this.messageService.setErrorMessage('Hiba történt az adatok letöltése során. Próbáld meg később!');
      }
    );
  }
  

  addAnswer(): void {
    this.poll.answers.push({ answerText: '' });
  }
  
  removeAnswer(index: number) {
    this.poll.answers.splice(index, 1);
  }
  
  createPoll(): void {
    // Ellenőrzés: van-e kérdés és legalább két válasz
    if (!this.poll.question || this.poll.question.trim() === '') {
      this.messageService.setErrorMessage('Hiba: Kérdés meg kell adni!');
      return;
    }
  
    if (!this.poll.answers || this.poll.answers.length < 2) {
      this.messageService.setErrorMessage('Hiba: Legalább két válasz kell!');
      return;
    }
  
    // Ha minden rendben, mentés a szerverre
    this.voteService.saveVote(this.poll).subscribe({
      next: (response) => {        
        // Sikeres mentés után frissítjük a listát
        this.getPreviousVotes();
        
        // Üres űrlap visszaállítása
        this.poll = {
          question: '',
          end_date: '',
          answers: [{ answerText: '' }]
        };
        
        // Sikerüzenet megjelenítése
        this.messageService.setMessage('Szavazás sikeresen létrehozva!');
      },
      error: (error) => {
        console.error('Hiba a szavazás mentésekor:', error);
        this.messageService.setErrorMessage('Hiba történt a mentés során. Próbáld újra!');
      }
    });
  }
  
  deleteVote(questionId: number): void {
    const modalRef = this.modalService.open(ConfirmmodalComponent, { centered: true, size: 'sm' });
    modalRef.componentInstance.confirmMessage = 'Biztosan törlöd a szavazást?';
  
    modalRef.result.then(
      (result: string) => {
        if (result === 'confirmed') {
          this.voteService.deleteVote(questionId).subscribe(() => {
            this.messageService.setMessage('Szavazás sikeresen törölve.');
            this.getPreviousVotes(); // Lista frissítése törlés után
          });
        }
      },
      () => {
        
      }
    );
  }
  
  saveExpiration(vote: any): void {
    if (!vote.end_date) {
      this.messageService.setErrorMessage('Hiba: A lejárati idő nem lehet üres!');
      return;
    }
  
    this.voteService.updateVoteExpiration(vote.question_id, vote.end_date).subscribe({
      next: () => {
        this.messageService.setMessage('Lejárati idő sikeresen frissítve!');
        this.getPreviousVotes();
      },
      error: () => {
        this.messageService.setErrorMessage('Hiba történt a módosítás során.');
      }
    });
  }
  

  trackByAnswerId(index: number, answer: any): number {
    return index; // vagy válasz objektum egyedi azonosítója, ha van
  }
  sanitizeHTML(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getVotesDescription() {
    const message = this.descriptionService.getVotesDescription();
    const modalRef = this.modalService.open(InfomodalComponent, { centered: true });
        modalRef.componentInstance.infoMessage = message;
  }
}

