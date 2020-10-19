import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faArrowCircleLeft, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { catchError } from 'rxjs/operators';
import { AlertService } from 'src/app/alert/alert.service';
import { ErrorService } from 'src/app/error.service';
import { User } from 'src/app/user';
import { FollowService } from '../follow.service';
import { LoadingService } from '../loading.service';
import { Paginated } from '../paginated';

@Component({
  selector: 'app-profile-followers',
  templateUrl: './profile-followers.component.html',
  styleUrls: ['./profile-followers.component.css']
})
export class ProfileFollowersComponent implements OnInit {
  pageSize = 10;
  followers: User[] = [];
  loadingFollowers: boolean;
  paginatedFollowers: Paginated<User>;
  pageFollowers: number = 1;
  initFollowers = false;
  username: string;
  notFound: boolean = false;
  forbidden: boolean = false;
  arrowLeft = faArrowCircleLeft;

  constructor(
    private loadingService: LoadingService,
    private followService: FollowService,
    private route: ActivatedRoute,
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
    this.initFollowers = false;
    this.paginatedFollowers = null;
    this.followers = [];
    this.pageFollowers = 1;
    this.loadFollowers();
  }

  loadFollowers(increment: number = 0): void {
    if (increment > 0 && this.paginatedFollowers && !this.paginatedFollowers.next) {
      return;
    }

    this.loadingService.load();
    this.loadingFollowers = true;
    this.followService.getFollowers(this.username, this.pageFollowers + increment, this.pageSize)
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
              this.alertService.error('Unable to fetch followers');
            }
          }
          else {
            this.alertService.error('Unable to fetch followers');
          }
        }, new Paginated<User>()))
    )
    .subscribe(paginated => 
      {
        const followers = paginated.results;
        this.paginatedFollowers = paginated;
        this.pageFollowers += increment;

        this.followers.push(...followers.filter(f => this.followers.filter(ff => ff.id == f.id).length == 0));
        this.loadingFollowers = false;

        this.initFollowers = true;

        this.loadingService.unload();
      });
  }

  @HostListener('window:scroll', []) onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 160) {
      if (this.paginatedFollowers.next) {
        this.loadFollowers(1);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loadMoreIfNoScroll();
  }

  loadMoreIfNoScroll() {
    const w : any = window;

    if (w.scrollMaxY == 0) {
      this.loadFollowers(1);
    }
  }
}
