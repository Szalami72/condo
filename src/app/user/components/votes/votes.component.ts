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

  @Input() votes: any[] = [];
  selectedAnswer: any = null;
  userId: number | null = null;

  constructor(private voteService: VoteService) { }

  ngOnInit(): void {
    const currentUser = this.getCurrentUserDatas();
    if (currentUser) {
      this.userId = currentUser.id;
      this.setSelectedAnswer();
    }
  }

  // Set the selected answer based on previous user votes
  setSelectedAnswer(): void {
    if (this.votes.length > 0 && this.userId) {
      // Look for a vote by the current user in the votes table
      const userVote = this.votes[0].answers.find((answer: any) =>
        answer.user_vote === 1 // If the user has voted for this answer
      );
  
      if (userVote) {
        this.selectedAnswer = userVote;
      }
    }
  }
  
  // Handle the answer selection
  selectAnswer(answer: any) {
    this.selectedAnswer = answer;
  }
  

  // Submit the vote
  submitVote(): void {
    if (!this.selectedAnswer) {
      console.error('Nincs kiválasztott válasz.');
      return;
    }
  
    const voteData = {
      user_id: this.userId,
      question_id: this.votes[0].question_id,
      answer_id: this.selectedAnswer.answer_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  
    // If the user has already voted, update the vote
    this.voteService.submitVote(voteData).subscribe(
      response => {
        console.log('Sikeres szavazás:', response);
        this.getVotes(); // Refresh the votes
      },
      error => {
        console.error('Hiba történt a szavazás során:', error);
      }
    );
    this.selectAnswer(null);
  }
  
  // Get the current user data from localStorage or sessionStorage
  private getCurrentUserDatas(): any {
    const currentUserData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUserData) {
      const parsedData = JSON.parse(currentUserData);
      parsedData.id = Number(parsedData.id);
      return parsedData;
    }
    return null;
  }

  // Refresh the list of votes for the current user
  private getVotes(): void {
    this.voteService.getVotes(this.userId ?? 0, this.votes[0].question_id ?? 0).subscribe({
      next: (response) => {
        // Only keep votes with the status 'open'
        this.votes = response.data.filter((vote: { status: string; }) => vote.status === 'open');
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
