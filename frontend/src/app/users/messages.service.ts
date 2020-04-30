import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { AuthService } from '../auth.service';
import { of, Observable } from 'rxjs';
import { Message } from './message';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { Paginated } from './paginated';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private messagesUrl= `${environment.apiUrl}/messages/`;
  private wsChatUrl = `${environment.wsUrl}/chat/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService,
    private authService: AuthService,
  ) { }

  get(with_user: number, page: number, page_size: number): Observable<Paginated<Message>> {
    let options = {};
    let params = new HttpParams();

    if (with_user) {
      params = params.set('with_user', with_user.toString());
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    if (with_user || page || page_size) {
      options = {params: params};
    }

    return this.http.get<Paginated<Message>>(`${this.messagesUrl}`, options)
      .pipe(
        map(response => {
          if (response && response.results) {
            response.results = this.getProperlyTypedMessages(response.results);
          }
          return response;
        }),
        catchError(this.errorService.handleError<Paginated<Message>>('get', (e: any) => 
        { 
          this.alertService.error('Unable to fetch messages');
        }, new Paginated<Message>()))
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

    return of(true);
  }

  getChatSocket(username: string, correspondent: string, token: string): WebSocketSubject<Message> {
    let orderedUsers = [username, correspondent].sort((a, b) => a.localeCompare(b));
    return webSocket(`${this.wsChatUrl}${orderedUsers[0]}/${orderedUsers[1]}/?token=${token}`);
  }
}
