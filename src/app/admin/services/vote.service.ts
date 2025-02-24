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

  constructor(private http: HttpClient) { }

  getVotes(): Observable<any> {
    return this.http.get(this.getVotesApi);
  }

  saveVote(vote: any): Observable<any> {
    return this.http.post(this.saveVoteApi, vote);
  }

  deleteVote(voteId: number): Observable<any> {
    return this.http.post(this.deleteVoteApi, { id: voteId });}
}
