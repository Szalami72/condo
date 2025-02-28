import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../constans/constans';


@Injectable({
  providedIn: 'root'
})
export class VoteService {

  private getVotesApi = API_BASE_URL + 'votes/getvotes.php';

  private saveVoteApi = API_BASE_URL + 'votes/savevote.php';

  private deleteVoteApi = API_BASE_URL + 'votes/deletevote.php';

  private updateVoteApi = API_BASE_URL + 'votes/updatevoteexpiration.php';

  private submitVoteApi = API_BASE_URL + 'votes/submitvote.php';

  constructor(private http: HttpClient) { }

  getVotes(user_id: number, questionId: number,): Observable<any> {
    return this.http.post(this.getVotesApi, { user_id, id: questionId });
  }

  saveVote(vote: any): Observable<any> {
    return this.http.post(this.saveVoteApi, vote);
  }

  deleteVote(voteId: number): Observable<any> {
    return this.http.post(this.deleteVoteApi, { question_id: voteId });}

  updateVoteExpiration(questionId: number, newEndDate: string): Observable<any> {
      return this.http.post(this.updateVoteApi, { question_id: questionId, new_end_date: newEndDate });
    }

  submitVote(vote: any): Observable<any> {
      return this.http.post(this.submitVoteApi, vote);
    }
    
    
}
