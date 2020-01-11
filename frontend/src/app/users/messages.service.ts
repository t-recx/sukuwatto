import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { AuthService } from '../auth.service';
import { of, Observable } from 'rxjs';
import { Message } from './message';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private messagesUrl= `${environment.apiUrl}/messages/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService,
    private authService: AuthService,
  ) { }

  send(to_user: number, text: string) {
    return this.http.post<Message>(this.messagesUrl, {to_user: to_user, message: text}, this.httpOptions)
    .pipe(
      catchError(this.errorService.handleError<Message>('send', (e: any) => 
      {
        this.alertService.error('Unable to send message, try again later');
      }, new Message()))
    );
  }

  get(with_user: number): Observable<Message[]> {
    let options = {};
    let params = new HttpParams();

    if (with_user) {
      params = params.set('with_user', with_user.toString());
    }

    if (with_user) {
      options = {params: params};
    }

    return this.http.get<Message[]>(`${this.messagesUrl}`, options)
      .pipe(
        map(response => {
          if (response) {
            response = this.getProperlyTypedMessages(response);
          }
          return response;
        }),
        catchError(this.errorService.handleError<Message[]>('get', (e: any) => 
        { 
          this.alertService.error('Unable to fetch messages');
        }, []))
      );
  }

  getProperlyTypedMessages(messages: Message[]): Message[] {
    for(let message of messages) {
      message.date = new Date(message.date);
    }

    return messages;
  }

  getCanMessage(username: string): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      return of(false);
    }

    if (this.authService.getUsername() == username) {
      return of(false);
    }

    // todo: check specific message permissions, when created

    return of(true);
  }
}
