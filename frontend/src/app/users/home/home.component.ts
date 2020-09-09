import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { StreamsService } from '../streams.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Action } from '../action';
import { Paginated } from '../paginated';
import { AuthService } from 'src/app/auth.service';
import { PostsService } from '../posts.service';
import { Post } from '../post';
import { faCircleNotch, faStickyNote, faDumbbell, faRunning, faTasks, faImage } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { environment } from 'src/environments/environment';
import { PostImage } from '../post-image';
import { RefreshService } from '../refresh.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  actions: Action[];
  paginated: Paginated<Action>;
  paramChangedSubscription: Subscription;
  pageSize = 10;
  currentPage = 1;
  loadingOlderActions: boolean = false;
  loadingNewActions: boolean = false;
  newPostText: string;
  username: string;
  triedToPost: boolean = false;
  posting: boolean = false;
  imageUploading: boolean = false;
  loading: boolean = true;
  prevScrollY = 0;
  newActivityButtonVisible = true;

  faCircleNotch = faCircleNotch;
  faStickyNote = faStickyNote;
  strengthIcon = faTasks;
  cardioIcon = faRunning;

  activityTypeStrength = true;
  isSingleClickActivity = true;

  postImages: string[] = [];

  innerHeight: any;

  refreshingSubscription: Subscription;
  refreshingWithPullDown = false;

  newActions: Action[] = [];

  constructor(
    route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    private streamsService: StreamsService,
    private postsService: PostsService,
    private loadingService: LoadingService,
    private refreshService: RefreshService,
  ) {
    this.refreshingSubscription = this.refreshService.refreshing.subscribe(() => {
      this.refreshingWithPullDown = true;
      this.refreshService.triggerPullDownIcon();
      this.loadNewActions(1, () => setTimeout(() => {
        this.refreshService.finish();
        this.refreshingWithPullDown = false;
      }, 250), false);
    });

    this.activityTypeStrength = this.authService.getUserDefaultActivityTypeStrength();

    this.paramChangedSubscription = route.paramMap.subscribe(val => {
      this.setPageSize();
      this.loadParameterDependentData(val.get('username'));
    });
  }

  ngOnInit() {
  }

  getPageSize() {
    this.innerHeight = window.innerHeight;

    const navBarHeight = 294;
    const footerHeight = 187;
    const actionHeight = 69;

    let ps = Math.ceil((this.innerHeight - navBarHeight - footerHeight) / actionHeight);

    if (ps < 3) {
      ps = 3;
    }

    return ps;
  }

  setPageSize() {
    this.pageSize = this.getPageSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const w : any = window;

    if (w.scrollMaxY == 0) {
      this.loadOlderActions();
    }
  }

  @HostListener('window:scroll', []) onScroll(): void {
    if (window.scrollY > this.prevScrollY) {
      this.newActivityButtonVisible = false;
    }
    else if (window.scrollY < this.prevScrollY) {
      this.newActivityButtonVisible = true;
    }

    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 160) {
      this.loadOlderActions();
    }

    this.prevScrollY = window.scrollY;
  }

  newActivity() {
    this.isSingleClickActivity = true;

    setTimeout(() => {
      if (this.isSingleClickActivity) {
        if (this.activityTypeStrength) {
          this.router.navigate(['/users', this.authService.getUsername(), 'workout']);
        }
        else {
          this.router.navigate(['/users', this.authService.getUsername(), 'quick-activity']);
        }
      }
    }, 250);
  }

  switchActivityType() {
    this.isSingleClickActivity = false;

    this.activityTypeStrength = !this.activityTypeStrength;
    this.authService.setUserDefaultActivityTypeStrength(this.activityTypeStrength);
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
    this.refreshingSubscription.unsubscribe();
  }

  loadParameterDependentData(username: string) {
    this.posting = false;
    this.username = username;
    this.paginated = null;
    this.actions = null;
    this.newActions = [];
    this.newPostText = '';
    this.currentPage = 1;

    if (username && username == this.authService.getUsername()) {
      this.loading = true;
      this.loadingService.load();
      this.streamsService.getUserStream(this.currentPage, this.pageSize)
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

    this.loadingService.load();
    this.loadingOlderActions = true;

    this.streamsService.getUserStream(this.currentPage + 1, this.pageSize)
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

  loadNewActions(indexPage: number = 1, whenFinished = null, useLoadService: boolean = true) {
    if (this.loadingNewActions) {
      return;
    }

    if (indexPage == 1) {
      this.newActions = [];
    }

    this.loadingNewActions = true;

    if (!useLoadService) {
      this.loadingService.load();
    }

    this.streamsService.getUserStream(indexPage, this.pageSize)
      .subscribe(paginatedActions => {
        const numberOfNewRecords = paginatedActions.results.length - paginatedActions.results.filter(x =>
          this.actions.filter(y => y.id == x.id).length > 0).length;

        if (numberOfNewRecords > 0) {
          this.newActions.push(...this.getNewActions(this.actions.concat(this.newActions), paginatedActions.results));
          this.paginated.count = paginatedActions.count;
          this.currentPage = Math.floor(this.actions.concat(this.newActions).length / this.pageSize);
        }

        this.loadingNewActions = false;

        if (numberOfNewRecords == this.pageSize) {
          this.loadNewActions(indexPage + 1, whenFinished, useLoadService);
        }
        else {
          this.actions.unshift(...this.newActions);
          this.newActions = [];

          if (whenFinished) {
            whenFinished();
          }
        }

        if (!useLoadService) {
            this.loadingService.unload();
        }
      }, () => this.loadingNewActions = false);
  }

  post(): void {
    this.triedToPost = true;

    if (this.newPostText && this.newPostText.trim().length > 0) {
      this.posting = true;
      const post = new Post();

      post.text = this.newPostText;
      post.post_images = this.postImages.map(url => new PostImage(url));

      this.postsService.createPost(post)
      .subscribe(() => { 
        this.newPostText = ''; 
        this.postImages = [];
        this.triedToPost = false; 

        this.loadNewActions();

        this.posting = false;
      });
    }
  }

  uploadingInProgress() {
    this.imageUploading = true;
  }

  stoppedUploading() {
    this.imageUploading = false;
  }
}
