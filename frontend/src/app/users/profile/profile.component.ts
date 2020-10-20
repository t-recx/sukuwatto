import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { User } from 'src/app/user';
import { UserService } from 'src/app/user.service';
import { environment } from 'src/environments/environment';
import { faBirthdayCake, faMapMarkerAlt, faUserCircle, faAt, faEnvelope, faUserPlus, faUserMinus, faCircleNotch, faClock, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth.service';
import { FollowService } from '../follow.service';
import { ContentTypesService } from '../content-types.service';
import { MessagesService } from '../messages.service';
import { Action } from '../action';
import { Paginated } from '../paginated';
import { StreamsService } from '../streams.service';
import { LoadingService } from '../loading.service';
import { PageSizeService } from '../page-size.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  hasFollowRequest: boolean;
  loadedIsFollowed = false;
  actions: Action[];
  paginated: Paginated<Action>;
  streamPageSize = 10;
  pageSize = 10;
  currentPage = 1;
  loading: boolean = false;
  loadingOlderActions: boolean = false;

  imageHidden: boolean = false;

  user: User;
  username: string;
  profileImageURL: string;
  birthDate: Date;

  canFollow: boolean;
  canMessage: boolean;
  isFollowed: boolean;

  userContentTypeID: number;

  notFound: boolean = false;

  faAt = faAt;
  faEnvelope = faEnvelope;
  faUserPlus = faUserPlus;
  faUserMinus = faUserMinus;
  faUserCircle = faUserCircle;
  faBirthdayCake = faBirthdayCake;
  faMapMarkerAlt = faMapMarkerAlt;
  faCircleNotch = faCircleNotch;
  faClock = faClock;
  faCheck = faCheck;
  faTimes = faTimes;

  messageModalVisible: boolean;

  operating: boolean = false;

  requests_number: number = 0;

  innerHeight = 0;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private userService: UserService,
    public authService: AuthService,
    private followService: FollowService,
    private contentTypesService: ContentTypesService,
    private messagesService: MessagesService,
    private streamsService: StreamsService,
    private loadingService: LoadingService,
    private pageSizeService: PageSizeService,
  ) { }

  getPageSize(navBarHeight = 64, actionHeight = 69) {
    this.innerHeight = window.innerHeight;

    const footerHeight = 187;

    let ps = Math.ceil((this.innerHeight - navBarHeight - footerHeight) / actionHeight);

    if (ps < 3) {
      ps = 3;
    }

    return ps;
  }

  setPageSize() {
    const topHeight = 200;
    this.streamPageSize = this.getPageSize(topHeight);
    this.pageSize = this.getPageSize(topHeight, 52);
  }

  loadMoreIfNoScroll() {
    const w : any = window;

    if (w.scrollMaxY == 0) {
      this.loadOlderActions();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loadMoreIfNoScroll();
  }

  @HostListener('window:scroll', []) onScroll(): void {
    if (this.pageSizeService.canScroll()) {
      this.loadOlderActions();
    }
  }

  ngOnInit() {
    this.contentTypesService.get("customuser").subscribe(x => {
        this.userContentTypeID = x.id;
    });

    this.route.paramMap.subscribe(params =>
      this.loadUserData(params.get('username')));
  }

  private loadIsFollowed(username: string) {
    this.loadedIsFollowed = false;

    if (this.authService.isLoggedIn() && !this.authService.isCurrentUserLoggedIn(username)) {
      this.followService.isFollowing(username).subscribe(f => {
        this.isFollowed = f.following;
        this.hasFollowRequest = f.requested;
        this.loadedIsFollowed = true;
      });
    }
    else {
      this.isFollowed = false;
      this.hasFollowRequest = false;
      this.loadedIsFollowed = true;
    }
  }

  private loadUserData(username: string) {
    this.setPageSize();
    this.paginated = null;
    this.loadedIsFollowed = false;
    this.notFound = false;
    this.operating = false;
    this.user = null;
    this.profileImageURL = null;
    this.birthDate = null;
    this.messageModalVisible = false;
    this.username = username;
    this.currentPage = 1;
    this.requests_number = 0;
    if (this.username) {
      this.userService
      .getUser(this.username)
      .subscribe(user => {
        if (user) {
          this.user = user;
          if (this.user.profile_filename) {
            this.profileImageURL = `${environment.mediaUrl}${this.user.profile_filename}`;
          }

          if (this.user.year_birth && this.user.month_birth) {
            this.birthDate = new Date(this.user.year_birth, this.user.month_birth - 1);
          }

          this.followService.getCanFollow(this.username).subscribe(x => this.canFollow = x);
          this.messagesService.getCanMessage(this.username).subscribe(x => this.canMessage = x);
          this.loadIsFollowed(this.username);

          if (!this.user.hidden) {
            this.loadFeed();
          }

          if (this.authService.isCurrentUserLoggedIn(this.username)) {
            this.followService.getFollowRequestNumber().subscribe(x => this.requests_number = x);
          }
        }
        else {
          this.notFound = true;
        }
      });
    }

    this.imageHidden = false;
  }

  hideImage() {
    this.imageHidden = true;
  }

  loadFeed(): void {
    this.actions = null;
    this.paginated = null;
    this.currentPage = 1;

    if (this.username) {
      this.loading = true;
      this.loadingService.load();
      this.streamsService.getActorStream(this.username, this.currentPage, this.streamPageSize)
      .subscribe(paginatedActions => {
        this.paginated = paginatedActions;
        this.actions = paginatedActions.results;
        this.loading = false;
        this.loadingService.unload();
      });
    }
  }

  loadOlderActions() {
    if (!this.paginated || this.loadingOlderActions || !this.paginated.next) {
      return;
    }

    this.loadingOlderActions = true;
    this.loadingService.load();

    this.streamsService.getActorStream(this.username, this.currentPage + 1, this.streamPageSize)
      .subscribe(paginatedActions => {
        this.paginated = paginatedActions;
        this.actions.push(...this.getNewActions(this.actions, paginatedActions.results));
        this.currentPage += 1;
        this.loadingOlderActions = false;
        this.loadingService.unload();
      }, () => this.loadingOlderActions = false);
  }

  getNewActions(a: Action[], b: Action[]): Action[] {
    return b.filter(n => a.filter(o => o.id == n.id).length == 0);
  }




  showMessageModal(): void {
    this.messageModalVisible = true;
  }

  follow(): void {
    this.operating = true;

    this.followService.follow(this.user.id).subscribe(x => {
      this.hasFollowRequest = x.requested == undefined ? false : x.requested;
      this.isFollowed = x.followed;

      if (this.isFollowed) {
        this.user.followers_number += 1;
      }

      this.operating = false;
    });
  }

  unfollow(): void {
    this.operating = true;

    this.followService.unfollow(this.user.id).subscribe(x =>  {
      this.operating = false;

      if (!x || !x.error) {
        this.user.followers_number -= 1;

        this.isFollowed = false;
        this.hasFollowRequest = false;
      }
    });
  }
}
