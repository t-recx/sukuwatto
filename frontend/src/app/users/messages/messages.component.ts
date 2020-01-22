import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessagesService } from '../messages.service';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/user';
import { environment } from 'src/environments/environment';
import { LastMessagesService } from '../last-messages.service';
import { LastMessage } from '../last-message';
import { faUserCircle, faReply } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {
  paramChangedSubscription: Subscription;
  username: string;
  lastMessages: LastMessage[];

  faUserCircle = faUserCircle;
  faReply = faReply;

  constructor(
    private lastMessagesService: LastMessagesService,
    private authService: AuthService,
    public route: ActivatedRoute, 
  ) { 
    this.paramChangedSubscription = route.paramMap.subscribe(val => 
      {
        this.loadParameterDependentData(val.get('username'));
      });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  loadParameterDependentData(username: string) {
    this.username = username;
    if (username == this.authService.getUsername()) {
      this.lastMessagesService.get()
      .subscribe(lastMessages => 
        this.lastMessages = lastMessages
                            .sort((a,b) => (new Date(b.date)).getTime() - (new Date(a.date)).getTime()));
    }
    else {
      this.lastMessages = null;
    }
  }

  getProfileImageURL(user: User): string {
    if (!user.profile_filename) {
      return null;
    }

    return `${environment.mediaUrl}${user.profile_filename}`;
  }

  getUserContactName(user: User) {
    if (user.first_name) {
      return user.first_name + ' ' + user.last_name;
    }

    return user.username;
  }

  getTime(message: LastMessage): string {
    if (message.date.toLocaleDateString() != (new Date()).toLocaleDateString()) {
      return message.date.toLocaleDateString();
    }

    return message.date.toLocaleTimeString().substring(0, 5);
  }

  wasReply(message: LastMessage): boolean {
    return message.user.username == this.authService.getUsername();
  }
}
