import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoteService } from '../../../admin/services/vote.service';

@Component({
  selector: 'app-votes',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './votes.component.html',
  styleUrls: ['./votes.component.css']
})
export class VotesComponent implements OnInit {

  votes: any[] = [];
  selectedAnswers: { [key: number]: any } = {};
  userId: number | null = null;
  hasOpenVote: { [key: number]: boolean } = {}; // Kérdésenként tároljuk a nyitottságot
  canViewResults: { [key: number]: boolean } = {}; // Kérdésenként tároljuk a megtekinthetőséget

  constructor(private voteService: VoteService) { }

  ngOnInit(): void {
    const currentUser = this.getCurrentUserDatas();
    if (currentUser) {
      this.userId = currentUser.id;
      this.getVotes();
    }
  }

  // 🔹 Betöltjük az összes szavazást és ellenőrizzük az állapotukat
  private getVotes(): void {
    if (!this.userId) {
      console.error("User ID is missing");
      return;
    }
  
    this.voteService.getVotes(this.userId, 0).subscribe({
      next: (response) => {
        const now = new Date();
  
        // Szűrjük a szavazásokat, hogy csak az aktív vagy a három napon belüli lejárt szavazások maradjanak
        this.votes = response.data.filter((vote: any) => {
          const endDate = new Date(vote.end_date);
          const threeDaysAfterEnd = new Date(endDate);
          threeDaysAfterEnd.setDate(threeDaysAfterEnd.getDate() + 3);
  
          const isExpired = now > endDate;
          return vote.status === 'open' || (isExpired && now <= threeDaysAfterEnd);
        }).map((vote: any) => {
          const endDate = new Date(vote.end_date);
          const threeDaysAfterEnd = new Date(endDate);
          threeDaysAfterEnd.setDate(threeDaysAfterEnd.getDate() + 3);
  
          // Szavazás státuszok
          this.hasOpenVote[vote.question_id] = vote.status === 'open';
          const isExpired = now > endDate;
          this.canViewResults[vote.question_id] = isExpired && now <= threeDaysAfterEnd;
  
          return vote;
        });
  
        // Aktív szavazások előrébb rendezése
        this.votes.sort((a: any, b: any) => {
          if (a.status === 'open' && b.status !== 'open') {
            return -1;  // Aktív szavazás előrébb kerüljön
          }
          if (a.status !== 'open' && b.status === 'open') {
            return 1;  // Lezárt szavazás hátrébb kerüljön
          }
          return 0;  // Egyébként nem változik a sorrend
        });
  
      },
      error: (error) => {
        console.error("Hiba a szavazások lekérése során:", error);
      }
    });
  }
  
  

  // 🔹 A felhasználó korábbi szavazatának visszaállítása
  setSelectedAnswer(): void {
    if (this.votes.length > 0 && this.userId) {
      this.votes.forEach(vote => {
        const userVote = vote.answers.find((answer: any) => answer.user_vote === 1);
        if (userVote) {
          this.selectedAnswers[vote.question_id] = userVote;
        }
      });
    }
  }

  // 🔹 Szavazat kiválasztása kérdésenként
  selectAnswer(questionId: number, answer: any): void {
    if (this.selectedAnswers[questionId]?.answer_id === answer.answer_id) {
      // Ha ugyanarra a válaszra kattintunk, akkor eltávolítjuk a kijelölést
      delete this.selectedAnswers[questionId];
    } else {
      // Különben beállítjuk a választott választ
      this.selectedAnswers[questionId] = answer;
    }
  }
  

  // 🔹 Szavazat leadása kérdésenként
  submitVote(questionId: number): void {
    const selectedAnswer = this.selectedAnswers[questionId];

    if (!selectedAnswer || !this.hasOpenVote[questionId]) {
      console.error('Nincs kiválasztott válasz vagy a szavazás már lezárult.');
      return;
    }

    const voteData = {
      user_id: this.userId,
      question_id: questionId,
      answer_id: selectedAnswer.answer_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.voteService.submitVote(voteData).subscribe(
      response => {
        console.log('Sikeres szavazás:', response);
        this.getVotes(); // Frissítjük az összes szavazást
      },
      error => {
        console.error('Hiba történt a szavazás során:', error);
      }
    );

    // Töröljük a kiválasztott választ
    this.selectedAnswers[questionId] = null;
  }

  // 🔹 Felhasználói adatok lekérése
  private getCurrentUserDatas(): any {
    const currentUserData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUserData) {
      const parsedData = JSON.parse(currentUserData);
      parsedData.id = Number(parsedData.id);
      return parsedData;
    }
    return null;
  }

  getExpirationDate(endDate: string): string {
  const end = new Date(endDate);
  end.setDate(end.getDate() + 3); // Hozzáadunk 3 napot
  return end.toISOString(); // Az ISO formátumú dátumot használjuk a biztonságos kezelés érdekében
}

}
