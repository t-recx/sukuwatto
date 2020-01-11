import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { AuthService } from '../auth.service';
import { of, Observable } from 'rxjs';
import { LastMessage } from './last-message';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LastMessagesService {
  private messagesUrl= `${environment.apiUrl}/last-messages/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService,
    private authService: AuthService,
  ) { }

  get(): Observable<LastMessage[]> {
    let options = {};

    return this.http.get<LastMessage[]>(`${this.messagesUrl}`, options)
      .pipe(
        map(response => {
          if (response) {
            response = this.getProperlyTypedLastMessages(response);
          }
          return response;
        }),
        catchError(this.errorService.handleError<LastMessage[]>('get', (e: any) => 
        { 
          this.alertService.error('Unable to fetch last messages');
        }, []))
      );
  }

  getProperlyTypedLastMessages(messages: LastMessage[]): LastMessage[] {
    for(let message of messages) {
      message.date = new Date(message.date);
    }

    return messages;
  }
}
