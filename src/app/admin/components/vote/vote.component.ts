import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { MenuComponent } from "../menu/menu.component";
import { VoteService } from '../../services/vote.service';
import { FormsModule } from '@angular/forms';
import { MessageComponent } from '../../../shared/sharedcomponents/message/message.component';
import { MessageService } from '../../../shared/services/message.service';

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
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.getPreviousVotes();
  }  


  getPreviousVotes() {
    this.voteService.getVotes().subscribe(
      data => {
        this.previousVotes = data.data;
        console.log('prevvotes', this.previousVotes);
      },
      error => {
        this.messageService.setErrorMessage('Hiba történt az adatok letöltése során. Próbáld meg később!');      }
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
  
  

  trackByAnswerId(index: number, answer: any): number {
    return index; // vagy válasz objektum egyedi azonosítója, ha van
  }
  sanitizeHTML(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}

