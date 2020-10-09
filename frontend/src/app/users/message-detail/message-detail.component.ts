import { Component, OnInit, OnDestroy, ViewChildren, ViewChild, QueryList, ElementRef, AfterViewInit, AfterViewChecked, Renderer2, HostListener } from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { faPaperPlane, faUserCircle, faClock, faCheckCircle, faTimes, faTrash, faEdit, faPen, faCopy } from '@fortawesome/free-solid-svg-icons';
import { User } from 'src/app/user';
import { Message } from '../message';
import { environment } from 'src/environments/environment';
import { Subscription, Subject, interval } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { MessagesService } from '../messages.service';
import { UserService } from 'src/app/user.service';
import { LastMessagesService } from '../last-messages.service';
import { debounce, switchMap, filter } from 'rxjs/operators';
import { Paginated } from '../paginated';
import { LoadingService } from '../loading.service';
import { v4 as uuid } from 'uuid';
import { TimeService } from '../time.service';

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.component.html',
  styleUrls: ['./message-detail.component.css']
})
export class MessageDetailComponent implements OnInit, OnDestroy, AfterViewChecked {
  private scrollContainer: any;
  private isNearBottom = true;

  loading: boolean = false;
  imageHidden: boolean = false;

  messageBeingEdited: Message = null;

  previousScrollHeight: number = 0;
  loadingOlderMessages: boolean = false;

  @ViewChild('messageInput', { read: ElementRef }) messageInput: ElementRef;
  @ViewChild('scrollframe') scrollFrame: ElementRef;
  @ViewChildren('message') itemElements: QueryList<any>;

  faPaperPlane = faPaperPlane;
  faUserCircle = faUserCircle;
  faClock = faClock;
  faTimes = faTimes;
  faCheckCircle = faCheckCircle;
  faTrash = faTrash;
  faEdit = faEdit;
  faPen = faPen;
  faCopy = faCopy;

  chatroomName: string;
  username: string;
  correspondent_username: string;

  newMessageSubject: Subject<Message>;
  chatSocket: WebSocketSubject<Message>;
  user: User;
  correspondent: User;
  messages: Message[];
  paginated: Paginated<Message>;
  newMessage: string;
  viewInitialized: boolean = false;
  pageSize = 10;
  currentPage = 1;

  newMessageSubscription: Subscription;
  updateMessageDataSubscription: Subscription;
  paramChangedSubscription: Subscription;
  itemElementsChangedSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private messagesService: MessagesService,
    private lastMessagesService: LastMessagesService,
    private usersService: UserService,
    public route: ActivatedRoute, 
    private loadingService: LoadingService,
    private timeService: TimeService,
  ) {
    this.paramChangedSubscription = route.paramMap.subscribe(val => {
      this.loadParameterDependentData(val.get('username'), val.get('correspondent'));
    });
  }

  ngOnInit() {
    this.newMessageSubject = new Subject<Message>();

    this.newMessageSubscription = this.newMessageSubject
      .pipe(filter(x => x.from_user != this.user.id), debounce(() => interval(2000)), switchMap(x =>
        this.lastMessagesService.updateLastMessageRead(this.correspondent.id)
      ))
      .subscribe();

    this.updateMessageDataSubscription = this.newMessageSubject
      .subscribe(newMessage => {
        if (this.messageWasReceived(newMessage)) {
          this.messages.push(newMessage);
        }
        else {
          const message = this.messages.filter(m => m.uuid == newMessage.uuid)[0];

          if (message) {
            message.unreceived = false;
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
    this.newMessageSubscription.unsubscribe();
    this.updateMessageDataSubscription.unsubscribe();

    if (this.itemElementsChangedSubscription) {
      this.itemElementsChangedSubscription.unsubscribe();
    }

    if (this.chatSocket) {
      this.chatSocket.unsubscribe();
    }
  }

  ngAfterViewChecked(): void {
    this.setScrollContainer();
  }

  hideImage() {
    this.imageHidden = true;
  }

  windowResized() {
    if (this.isNearBottom) {
      this.scrollToBottom(false);

      // we'll do this because sometimes the virtual keyboard takes a bit to disappear
      setTimeout(() => {
        this.scrollToBottom(false);
      }, 50);
    }
  }

  setScrollContainer(): void {
    if (this.scrollFrame) {
      this.scrollContainer = this.scrollFrame.nativeElement;

      if (this.scrollContainer) {
        if (!this.itemElementsChangedSubscription) { 
            this.itemElementsChangedSubscription = this.itemElements.changes
          .subscribe(_ => this.onItemElementsChanged());  

            this.scrollToBottom();
        }
      }
    }
  }

  private onItemElementsChanged(): void {
    if (this.isNearBottom) {
      this.scrollToBottom();
    }
    else {
        if (this.scrollContainer.scrollHeight > this.previousScrollHeight) { 
            this.scrollContainer.scrollTop += this.scrollContainer.scrollHeight - this.previousScrollHeight;
        }
    }
  }

  private scrollToBottom(smooth: boolean = true): void {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0,
      behavior: smooth ? 'smooth' : 'auto'
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

    if (this.scrollContainer.scrollTop == 0) {
      this.loadOlderMessages();
    }
  }

  loadOlderMessages() {
    if (this.loadingOlderMessages || !this.paginated.next) {
      return;
    }

    this.previousScrollHeight = this.scrollContainer.scrollHeight;
    this.loadingOlderMessages = true;

    this.messagesService.get(this.correspondent.id, this.currentPage + 1, this.pageSize)
    .subscribe(messages => {

      this.paginated = messages;
      this.messages = messages.results.concat(this.messages);
      this.currentPage += 1;
      this.loadingOlderMessages = false;

    }, () => this.loadingOlderMessages = false);
  }

  loadParameterDependentData(username: string, correspondent_username: string) {
    this.username = username;
    this.correspondent_username = correspondent_username;
    this.newMessage = "";
    this.imageHidden = false;

    if (username && correspondent_username && username.length > 0 && correspondent_username.length > 0 &&
      username == this.authService.getUsername()) {
      
      this.loading = true;
      this.loadingService.load();
      this.usersService.getUser(correspondent_username).subscribe(user => {
        if (user) {
          this.correspondent = user;

          this.messagesService.get(this.correspondent.id, this.currentPage, this.pageSize)
          .subscribe(messages => {
            this.paginated = messages;
            this.messages = messages.results;

            this.loading = false;
            this.loadingService.unload();
          });

          this.usersService.getUser(username).subscribe(u2 => {
            if (u2) {
              this.user = u2;
              this.lastMessagesService.updateLastMessageRead(this.correspondent.id).subscribe();
            }
          });

          if (this.chatSocket) {
            this.chatSocket.unsubscribe();
          }

          this.createChatSocket();
        }
      });
    }
    else {
      this.messages = null;
    }
  }

  createChatSocket() {
    this.chatSocket = this.messagesService.getChatSocket(this.username, this.correspondent_username);
    this.chatSocket
      .subscribe(newMessage => {
        if (this.messages) {
          if (newMessage.type == 'chat_message') {
            newMessage.date = new Date(newMessage.date);
            this.newMessageSubject.next(newMessage);
          }
          else if (newMessage.type == 'delete_message') {
            this.messages = this.messages.filter(u => u.uuid != newMessage.uuid);
          }
          else if (newMessage.type == 'edit_message') {
            newMessage.date = new Date(newMessage.date);
            newMessage.edited_date = new Date(newMessage.edited_date);

            this.replaceMessage(newMessage);
          }
        }
      },
      () => {
        setTimeout(() => {
          this.createChatSocket();
        }, 1000);
      });
  }

  getProfileImageURL(user: User): string {
    if (!user.profile_filename) {
      return null;
    }

    return environment.mediaUrl + user.profile_filename;
  }

  getUserContactName(user: User): string {
    if (user.first_name) {
      return user.first_name + ' ' + user.last_name;
    }

    return user.username;
  }

  messageWasSent(message: Message): boolean {
    return message.from_user == this.user.id;
  }

  messageWasReceived(message: Message): boolean {
    return !this.messageWasSent(message);
  }

  getMessageTime(date: Date): string {
    return this.timeService.getTime(date);
  }

  replaceMessage(newMessage: Message) {
    const i = this.messages.findIndex(x => x.uuid == newMessage.uuid);

    if (i >= 0) {
      this.messages[i] = newMessage;
    }
  }

  sendMessage(): void {
    if (this.chatSocket && this.newMessage && this.newMessage.trim().length > 0) {
      let newMessage: Message;

      if (this.messageBeingEdited) {
        newMessage = new Message(this.messageBeingEdited);

        newMessage.message = this.newMessage;
        newMessage.type = 'edit_message';
        newMessage.edited_date = new Date();
        newMessage.edit_unconfirmed = true;

        this.replaceMessage(newMessage);

        this.messageBeingEdited = null;
      }
      else {
        newMessage = new Message();
        newMessage.type = "chat_message";
        newMessage.date = new Date();
        newMessage.uuid = uuid();
        newMessage.from_user = this.user.id;
        newMessage.to_user = this.correspondent.id;
        newMessage.message = this.newMessage;
        newMessage.unreceived = true;

        this.messages.push(newMessage);
      }

      this.newMessage = "";
      this.chatSocket.next(newMessage);
    }
  }

  deleteMessage(message: Message) {
    message.type = "delete_message";

    this.chatSocket.next(message);
  }

  editMessage(message: Message) {
    this.messageBeingEdited = message;
    this.newMessage = message.message;

    this.messageInput.nativeElement.focus();
  }

  copyToClipboard(message: Message){
    const val = message.message;
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  toggleContextMenu(message: Message) {
    if (!this.messageWasSent(message)) {
      return;
    }

    message.context_menu_open = !message.context_menu_open;

    if (message.context_menu_open) {
      if (this.messages) {
        this.messages.filter(x => x.context_menu_open && x != message).forEach(x => x.context_menu_open = false);
      }
    }
  }

  cancelEdit()  {
    this.messageBeingEdited = null;
    this.newMessage = "";

    setTimeout(() => this.messageInput.nativeElement.focus());
  }

  @HostListener('document:click')
  clickout() {
    if (this.messages) {
      this.messages.filter(x => x.context_menu_open).forEach(x => x.context_menu_open = false);
    }
  }
}
