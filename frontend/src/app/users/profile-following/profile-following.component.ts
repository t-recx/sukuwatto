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
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params =>
      this.load(params.get('username')));
  }

  setPageSize() {
    const innerHeight = window.innerHeight;

    const navBarHeight = 294;
    const footerHeight = 187;
    const actionHeight = 32;

    let ps = Math.ceil((innerHeight - navBarHeight - footerHeight) / actionHeight);

    if (ps < 3) {
      ps = 3;
    }

    this.pageSize = ps;
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
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 160) {
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
