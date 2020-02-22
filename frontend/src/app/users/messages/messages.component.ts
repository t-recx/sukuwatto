import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessagesService } from '../messages.service';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/user';
import { environment } from 'src/environments/environment';
import { LastMessagesService } from '../last-messages.service';
import { LastMessage } from '../last-message';
import { faUserCircle, faReply, faPen } from '@fortawesome/free-solid-svg-icons';
import { FollowService } from '../follow.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {
  paramChangedSubscription: Subscription;
  username: string;
  lastMessages: LastMessage[];
  availableUsersToMessage: User[];

  faUserCircle = faUserCircle;
  faReply = faReply;
  faPen = faPen;

  newMessageVisible: boolean = false;

  constructor(
    private lastMessagesService: LastMessagesService,
    private authService: AuthService,
    public route: ActivatedRoute, 
    private router: Router,
    private followService: FollowService,
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

  newMessage(): void {
    this.newMessageVisible = true;
  }

  hideNewMessageModal(): void {
    this.newMessageVisible = false;
  }

  loadParameterDependentData(username: string) {
    this.username = username;
    this.newMessageVisible = false;
    if (username == this.authService.getUsername()) {
      this.lastMessagesService.get()
      .subscribe(lastMessages => 
        this.lastMessages = lastMessages
                            .sort((a,b) => (new Date(b.date)).getTime() - (new Date(a.date)).getTime()));

      this.followService.getFollowing(this.username).subscribe(following => 
        {
          this.availableUsersToMessage = following;
        });
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

  messageUser(messagedUser: any) {
    this.router.navigate([`/users/${this.authService.getUsername()}/message/${messagedUser.username}`])
    this.newMessageVisible = false;
  }
}