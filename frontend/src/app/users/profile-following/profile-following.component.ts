import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faArrowCircleLeft, faUserMinus } from '@fortawesome/free-solid-svg-icons';
import { catchError } from 'rxjs/operators';
import { AlertService } from 'src/app/alert/alert.service';
import { AuthService } from 'src/app/auth.service';
import { ErrorService } from 'src/app/error.service';
import { User } from 'src/app/user';
import { FollowService } from '../follow.service';
import { LoadingService } from '../loading.service';
import { PageSizeService } from '../page-size.service';
import { Paginated } from '../paginated';

@Component({
  selector: 'app-profile-following',
  templateUrl: './profile-following.component.html',
  styleUrls: ['./profile-following.component.css']
})
export class ProfileFollowingComponent implements OnInit {
  pageSize = 10;
  following: User[] = [];
  paginatedFollowing: Paginated<User>;
  pageFollowing: number = 1;
  showUnfollowButtonOnFollowingList: boolean;
  loadingFollowing: boolean = false;
  username: string;
  initFollowing = false;
  notFound: boolean = false;
  forbidden: boolean = false;
  arrowLeft = faArrowCircleLeft;

  faUserMinus = faUserMinus;

  constructor(
    private loadingService: LoadingService,
    private followService: FollowService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private errorService: ErrorService,
    private alertService: AlertService,
    private pageSizeService: PageSizeService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params =>
      this.load(params.get('username')));
  }

  setPageSize() {
    this.pageSize = this.pageSizeService.getPageSize(32);
  }

  private load(username: string) {
    this.username = username;
    this.setPageSize();
    this.forbidden = false;
    this.notFound = false;
    this.initFollowing = false;
    this.paginatedFollowing = null;
    this.following = [];
    this.pageFollowing = 1;

    this.loadFollowing();
    
    this.showUnfollowButtonOnFollowingList = this.authService.isCurrentUserLoggedIn(this.username);
  }

  loadFollowing(increment: number = 0): void {

    if (increment > 0 && this.paginatedFollowing && !this.paginatedFollowing.next) {
      return;
    }

    this.loadingFollowing = true;
    this.loadingService.load();
    this.followService
    .getFollowing(this.username, this.pageFollowing + increment, this.pageSize)
    .pipe(
        catchError(this.errorService.handleError<Paginated<User>>('following', (e: any) => 
        { 
          if (e && e.status) {
            if (e.status == 403) {
              this.forbidden = true;
            }
            else if (e.status == 404) {
              this.notFound = true;
            }
            else {
              this.alertService.error('Unable to fetch following');
            }
          }
          else {
            this.alertService.error('Unable to fetch following');
          }
        }, new Paginated<User>()))
    )
    .subscribe(paginated => 
      {
        const following = paginated.results;
        this.paginatedFollowing = paginated;
        this.pageFollowing += increment;

        this.following.push(...following.filter(f => this.following.filter(ff => ff.id == f.id).length == 0));
        this.loadingFollowing = false;
        this.initFollowing = true;
        this.loadingService.unload();
      });
  }

  loadMoreIfNoScroll() {
    const w : any = window;

    if (w.scrollMaxY == 0) {
      this.loadFollowing(1);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loadMoreIfNoScroll();
  }

  @HostListener('window:scroll', []) onScroll(): void {
    if (this.pageSizeService.canScroll()) {
      if (this.paginatedFollowing.next) {
        this.loadFollowing(1);
      }
    }
  }

  public unfollowUser(user: User): void {
    this.followService.unfollow(user.id).subscribe(x => 
      {
        if (!x || !x.error) {
          this.following = this.following.filter(f => f.id != user.id);
        }
      });
  }
}
