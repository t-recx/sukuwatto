import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { AuthService } from '../auth.service';
import { of, Observable, Subject } from 'rxjs';
import { LastMessage } from './last-message';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LastMessagesService {
  private messagesUrl= `${environment.apiUrl}/last-messages/`;
  private updateLastMessageUrl = `${environment.apiUrl}/update-last-message/`;
  private unreadUrl= `${environment.apiUrl}/unread-conversations/`;
  private dateLastUnreadUrl= `${environment.apiUrl}/last-unread-conversation/`;

  lastMessageUpdated = new Subject();
  unreadConversationsUpdated = new Subject<number>();

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

  getUnreadConversationsNumber(): Observable<number> {
    let options = {};

    return this.http.get<number>(`${this.unreadUrl}`, options)
      .pipe(
        tap(n => this.unreadConversationsUpdated.next(n)),
        catchError(this.errorService.handleError<number>('getUnreadConversationsNumber', (e: any) =>
        { 
          // this.alertService.error('Unable to fetch unread conversation number');
        }, null))
      );
  }

  getLastUnreadConversationDate(): Observable<Date> {
    let options = {};

    return this.http.get<Date>(`${this.dateLastUnreadUrl}`, options)
      .pipe(
        map(d => d ? new Date(d) : d),
        catchError(this.errorService.handleError<Date>('getLastUnreadConversationDate', (e: any) =>
        { 
          // this.alertService.error('Unable to fetch unread conversation date');
        }, null))
      );
  }

  updateLastMessageRead(correspondent_id: number, generateEvent: boolean = true): Observable<any> {
    return this.http.post<any>(`${this.updateLastMessageUrl}`, 
      {correspondent: correspondent_id}, this.httpOptions)
      .pipe(
        tap(x => { if (generateEvent) { this.lastMessageUpdated.next(); } }),
        catchError(this.errorService.handleError<any>('get', (e: any) => 
        { 
          this.alertService.error('Unable to update last message read');
        }, null))
      );
  }

  getProperlyTypedLastMessages(messages: LastMessage[]): LastMessage[] {
    for(let message of messages) {
      message.date = new Date(message.date);
    }

    return messages;
  }
}
