import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { Message } from './message';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private wsChatUrl = `${environment.wsUrl}/feed/`;
  newMessageSubject = new Subject<Message>();
  dataSubject = new Subject<any>();

  constructor() { }

  getFeedSocket(username: string): WebSocketSubject<any> {
    return webSocket(`${this.wsChatUrl}${username}/`);
  }
}
