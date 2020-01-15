import { Component, OnInit, OnDestroy, ViewChildren, ViewChild, QueryList, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { User } from 'src/app/user';
import { Message } from '../message';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MessagesService } from '../messages.service';
import { UserService } from 'src/app/user.service';
import { LastMessagesService } from '../last-messages.service';

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.component.html',
  styleUrls: ['./message-detail.component.css']
})
export class MessageDetailComponent implements OnInit, OnDestroy, AfterViewChecked {
  private scrollContainer: any;
  private isNearBottom = true;

  @ViewChild('scrollframe', {static: false}) scrollFrame: ElementRef;
  @ViewChildren('message') itemElements: QueryList<any>;

  faPaperPlane = faPaperPlane;

  username: string;
  correspondent_username: string;

  user: User;
  correspondent: User;
  messages: Message[];
  newMessage: string;
  viewInitialized: boolean = false;

  paramChangedSubscription: Subscription;
  itemElementsChangedSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private messagesService: MessagesService,
    private lastMessagesService: LastMessagesService,
    private usersService: UserService,
    public route: ActivatedRoute, 
  ) {
    this.paramChangedSubscription = route.paramMap.subscribe(val => 
      {
        this.loadParameterDependentData(val.get('username'), val.get('correspondent'));
      });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();

    if (this.itemElementsChangedSubscription) {
      this.itemElementsChangedSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked(): void {
    this.setScrollContainer();
  }

  setScrollContainer(): void {
    if (this.scrollFrame) {
      this.scrollContainer = this.scrollFrame.nativeElement;

      if (this.scrollContainer) {
        this.itemElementsChangedSubscription = this.itemElements.changes
          .subscribe(_ => this.onItemElementsChanged());  
      }
    }
  }

  private onItemElementsChanged(): void {
    if (this.isNearBottom) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  private isUserNearBottom(): boolean {
    const threshold = 50;
    const position = this.scrollContainer.scrollTop + this.scrollContainer.offsetHeight;
    const height = this.scrollContainer.scrollHeight;

    return position > height - threshold;
  }

  scrolled(event: any): void {
    this.isNearBottom = this.isUserNearBottom();
  }

  loadParameterDependentData(username: string, correspondent_username: string) {
    this.username = username;
    this.correspondent_username = correspondent_username;
    this.newMessage = "";

    if (username && correspondent_username && username.length > 0 && correspondent_username.length > 0 &&
      username == this.authService.getUsername()) {
      this.usersService.get(correspondent_username).subscribe(users => {
        if (users.length == 1) {
          this.correspondent = users[0];

          this.messagesService.get(this.correspondent.id).subscribe(messages => this.messages = messages);

          this.usersService.get(username).subscribe(users_ => {
            if (users_.length == 1) {
              this.user = users_[0];
              this.lastMessagesService.updateLastMessageRead(this.user.id, this.correspondent.id).subscribe();
            }
          });
        }
      });
    }
    else {
      this.messages = null;
    }
  }

  getProfileImageURL(user: User): string {
    if (!user.profile_filename) {
      return null;
    }

    return `${environment.mediaUrl}${user.profile_filename}`;
  }

  getUserContactName(user: User): string {
    if (user.first_name) {
      return user.first_name + ' ' + user.last_name;
    }

    return user.username;
  }

  messageWasSent(message: Message): boolean {
    return message.to_user == this.correspondent.id;
  }

  messageWasReceived(message: Message): boolean {
    return !this.messageWasSent(message);
  }

  getMessageTime(date: Date): string {
    return (new Date(date)).toLocaleTimeString().substring(0, 5);
  }

  sendMessage(): void {
    // todo
    let newMessage = new Message();
    newMessage.date = new Date();
    newMessage.from_user = this.user.id;
    newMessage.to_user = this.correspondent.id;
    newMessage.message = this.newMessage;

    this.messages.push(newMessage);

    newMessage = new Message();
    newMessage.date = new Date();
    newMessage.from_user = this.user.id;
    newMessage.to_user = 1092;
    newMessage.message = this.newMessage;

    this.messages.push(newMessage);

    this.newMessage = "";
  }
}
