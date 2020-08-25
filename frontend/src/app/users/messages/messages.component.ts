import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MessagesService } from '../messages.service';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/user';
import { environment } from 'src/environments/environment';
import { LastMessagesService } from '../last-messages.service';
import { LastMessage } from '../last-message';
import { faUserCircle, faReply, faPen, faComment } from '@fortawesome/free-solid-svg-icons';
import { FollowService } from '../follow.service';
import { LoadingService } from '../loading.service';
import { Paginated } from '../paginated';
import { TimeService } from '../time.service';

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

  paginatedUsers: Paginated<User>;

  faUserCircle = faUserCircle;
  faReply = faReply;
  faComment = faComment;
  faPen = faPen;

  imageHidden: boolean = false;

  newMessageVisible: boolean = false;

  loading: boolean = false;
  loadingUsers: boolean = false;
  forbidden: boolean = false;

  page: number = 1;
  pageSize: number = 10;

  constructor(
    private lastMessagesService: LastMessagesService,
    private authService: AuthService,
    public route: ActivatedRoute, 
    private router: Router,
    private followService: FollowService,
    private loadingService: LoadingService,
    private timeService: TimeService,
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

  hideImage() {
    this.imageHidden = true;
  }

  loadParameterDependentData(username: string) {
    this.paginatedUsers = null;
    this.page = 1;
    this.availableUsersToMessage = [];
    this.username = username;
    this.newMessageVisible = false;
    this.forbidden = false;
    if (username == this.authService.getUsername()) {

      this.loading = true;
      this.loadingService.load();
      this.lastMessagesService.get()
      .subscribe(lastMessages => {
        this.lastMessages = lastMessages
                            .sort((a,b) => (new Date(b.date)).getTime() - (new Date(a.date)).getTime());
        this.loading = false;
        this.loadingService.unload();
      });

      this.loadUsers();
    }
    else {
      this.lastMessages = null;
      this.forbidden = true;
    }

    this.imageHidden = false;
  }

  private loadUsers(increment: number = 0) {
    this.loadingUsers = true;
    this.loadingService.load();
    this.followService.getFollowing(this.username, this.page + increment, this.pageSize).subscribe(paginated => {
      this.paginatedUsers = paginated;
      const following = paginated.results;
      this.page += increment;

      this.availableUsersToMessage.push(...following);
      this.loadingUsers = false;
      this.loadingService.unload();
    });
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
      // visible height + pixel scrolled >= total height 
      if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
        if (!this.loadingUsers && this.paginatedUsers.next) {
          this.loadUsers(1);
        }
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
    return this.timeService.getTimeOrDateIfNotToday(message.date);
  }

  wasReply(message: LastMessage): boolean {
    let id;

    if (message.user.username == this.authService.getUsername()) {
      id = message.user.id;
    } else {
      id = message.correspondent.id;
    }

    return message.last_message.from_user == id;
  }

  messageUser(messagedUser: any) {
    this.router.navigate([`/users/${this.authService.getUsername()}/message/${messagedUser.username}`])
    this.newMessageVisible = false;
  }
}
