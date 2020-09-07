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

export enum UserViewProfileTab {
  Overview = 1,
  Followers = 2,
  Following = 3,
  Requests = 4,
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  loadedIsFollowed = false;
  actions: Action[];
  paginated: Paginated<Action>;
  streamPageSize = 10;
  pageSize = 10;
  currentPage = 1;
  loading: boolean = false;
  loadingFollowers: boolean = false;
  loadingFollowing: boolean = false;
  loadingRequests: boolean = false;
  loadingOlderActions: boolean = false;

  paginatedFollowers: Paginated<User>;
  paginatedFollowing: Paginated<User>;
  paginatedRequests: Paginated<User>;
  pageFollowers: number = 1;
  pageFollowing: number = 1;
  pageRequests: number = 1;

  imageHidden: boolean = false;

  user: User;
  username: string;
  profileImageURL: string;
  birthDate: Date;

  profileTab = UserViewProfileTab;
  selectedTab: UserViewProfileTab;

  canFollow: boolean;
  canMessage: boolean;
  isFollowed: boolean;
  hasFollowRequest: boolean;
  canShowRequestsTab: boolean = false;

  followers: User[] = [];

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

  following: User[] = [];
  showUnfollowButtonOnFollowingList: boolean;

  operating: boolean = false;

  requests: User[] = [];

  initFollowers = false;
  initFollowing = false;
  initRequests = false;

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
      if (this.selectedTab == UserViewProfileTab.Overview) {
        this.loadOlderActions();
      }
      else if (this.selectedTab == UserViewProfileTab.Followers) {
        this.loadFollowers(1);
      }
      else if (this.selectedTab == UserViewProfileTab.Following) {
        this.loadFollowing(1);
      }
      else if (this.selectedTab == UserViewProfileTab.Requests) {
        this.loadRequests(1);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loadMoreIfNoScroll();
  }

  @HostListener('window:scroll', []) onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 160) {
      switch(this.selectedTab) {
        case UserViewProfileTab.Overview:
          this.loadOlderActions();
          break;
        case UserViewProfileTab.Followers:
          if (this.paginatedFollowers.next) {
            this.loadFollowers(1);
          }
          break;
        case UserViewProfileTab.Following:
          if (this.paginatedFollowing.next) {
            this.loadFollowing(1);
          }
          break;
        case UserViewProfileTab.Requests:
          if (this.paginatedRequests.next) {
            this.loadRequests(1);
          }
          break;
      }
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
    this.initFollowers = false;
    this.initFollowing = false;
    this.initRequests = false;
    this.paginated = null;
    this.paginatedFollowers = null;
    this.paginatedFollowing = null;
    this.paginatedRequests = null;
    this.loadedIsFollowed = false;
    this.notFound = false;
    this.operating = false;
    this.selectedTab = UserViewProfileTab.Overview;
    this.user = null;
    this.profileImageURL = null;
    this.birthDate = null;
    this.messageModalVisible = false;
    this.username = username;
    this.following = [];
    this.followers = [];
    this.currentPage = 1;
    this.pageFollowers = 1;
    this.pageFollowing = 1;
    this.pageRequests = 1;
    if (this.username) {
      this.userService
      .getUser(this.username)
      .subscribe(user => {
        if (user) {
          this.canShowRequestsTab = this.authService.isCurrentUserLoggedIn(this.username);
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
          this.loadFeed();
          // this.loadFollowers();
          // this.loadFollowing();

          if (this.canShowRequestsTab) {
            this.loadRequests();
          }
        }
        else {
          this.notFound = true;
        }
      });
    }

    this.imageHidden = false;
    this.showUnfollowButtonOnFollowingList = this.authService.isCurrentUserLoggedIn(this.username);
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

  loadFollowers(increment: number = 0): void {
    this.initFollowers = true;

    if (increment > 0 && this.paginatedFollowers && !this.paginatedFollowers.next) {
      return;
    }

    this.loadingService.load();
    this.loadingFollowers = true;
    this.followService.getFollowers(this.username, this.pageFollowers + increment, this.pageSize).subscribe(paginated => 
      {
        const followers = paginated.results;
        this.paginatedFollowers = paginated;
        this.pageFollowers += increment;

        this.followers.push(...followers.filter(f => this.followers.filter(ff => ff.id == f.id).length == 0));
        this.loadingFollowers = false;
        this.loadingService.unload();
      });
  }

  loadFollowing(increment: number = 0): void {
    this.initFollowing = true;

    if (increment > 0 && this.paginatedFollowing && !this.paginatedFollowing.next) {
      return;
    }

    this.loadingFollowing = true;
    this.loadingService.load();
    this.followService.getFollowing(this.username, this.pageFollowing + increment, this.pageSize).subscribe(paginated => 
      {
        const following = paginated.results;
        this.paginatedFollowing = paginated;
        this.pageFollowing += increment;

        this.following.push(...following.filter(f => this.following.filter(ff => ff.id == f.id).length == 0));
        this.loadingFollowing = false;
        this.loadingService.unload();
      });
  }

  loadRequests(increment: number = 0): void {
    this.initRequests = true;

    if (increment > 0 && this.paginatedRequests && !this.paginatedRequests.next) {
      return;
    }

    this.loadingRequests = true;
    this.loadingService.load();
    this.followService.getFollowRequests(this.username, this.pageRequests + increment, this.pageSize).subscribe(paginated => 
      {
        const requests = paginated.results;
        this.paginatedRequests = paginated;
        this.pageRequests += increment;

        this.requests.push(...requests.filter(f => this.requests.filter(ff => ff.id == f.id).length == 0));
        this.loadingRequests = false;

        if (!this.requests || this.requests.length == 0) {
          this.canShowRequestsTab = false;
        }

        this.loadingService.unload();
      });
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
        this.followers = [new User({id: +this.authService.getUserId(), username: this.authService.getUsername()}), ...this.followers];
      }

      this.operating = false;
    });
  }

  unfollow(): void {
    this.operating = true;

    this.followService.unfollow(this.user.id).subscribe(x =>  {
      this.followers = this.followers.filter(f => f.id != +this.authService.getUserId());

      this.operating = false;
      this.isFollowed = false;
      this.hasFollowRequest = false;
    });
  }

  public unfollowUser(user: User): void {
    this.followService.unfollow(user.id).subscribe(x => 
      {
        this.following = this.following.filter(f => f.id != user.id);
      });
  }

  public acceptUser(user: User): void {
    this.followService.approveFollowRequest(user.id).subscribe(x =>
      {
        this.requests = this.requests.filter(f => f.id != user.id);
        this.followers.push(user);
      });
  }

  public rejectUser(user: User): void {
    this.followService.rejectFollowRequest(user.id).subscribe(x =>
      {
        this.requests = this.requests.filter(f => f.id != user.id);
      });
  }

  selectTab(tab: UserViewProfileTab): void {
    this.selectedTab = tab;

    switch (tab) {
      case UserViewProfileTab.Followers:
        if (!this.initFollowers) {
          this.loadFollowers();
        }
        break;

      case UserViewProfileTab.Following:
        if (!this.initFollowing) {
          this.loadFollowing();
        }
        break;

      case UserViewProfileTab.Requests:
        if (!this.initRequests) {
          this.loadRequests();
        }
        break;
    }
  }
}
