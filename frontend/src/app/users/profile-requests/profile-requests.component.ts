import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { faArrowCircleLeft, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth.service';
import { User } from 'src/app/user';
import { FollowService } from '../follow.service';
import { LoadingService } from '../loading.service';
import { Paginated } from '../paginated';

@Component({
  selector: 'app-profile-requests',
  templateUrl: './profile-requests.component.html',
  styleUrls: ['./profile-requests.component.css']
})
export class ProfileRequestsComponent implements OnInit {
  forbidden: boolean = false;
  username: string;
  loadingRequests: boolean = false;
  paginatedRequests: Paginated<User>;
  pageRequests: number = 1;
  pageSize = 10;
  requests: User[] = [];
  initRequests = false;
  arrowLeft = faArrowCircleLeft;

  faCheck = faCheck;
  faTimes = faTimes;

  constructor(
    private authService: AuthService,
    private followService: FollowService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
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

  load(username: string) {
    this.username = username;
    this.setPageSize();
    this.initRequests = false;
    this.paginatedRequests = null;
    this.pageRequests = 1;
    this.forbidden = false;

    if (this.authService.isCurrentUserLoggedIn(this.username)) {
      this.loadRequests();
    }
    else {
      this.forbidden = true;
    }
  }

  @HostListener('window:scroll', []) onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 160) {
      if (this.paginatedRequests.next) {
        this.loadRequests(1);
      }
    }
  }

  loadRequests(increment: number = 0): void {
    this.initRequests = true;

    if (increment > 0 && this.paginatedRequests && !this.paginatedRequests.next) {
      return;
    }

    this.loadingRequests = true;
    this.loadingService.load();
    this.followService.getFollowRequests(this.pageRequests + increment, this.pageSize).subscribe(paginated => 
      {
        const requests = paginated.results;
        this.paginatedRequests = paginated;
        this.pageRequests += increment;

        this.requests.push(...requests.filter(f => this.requests.filter(ff => ff.id == f.id).length == 0));
        this.loadingRequests = false;

        this.loadingService.unload();
      });
  }

  public acceptUser(user: User): void {
    this.followService.approveFollowRequest(user.id).subscribe(x =>
      {
        if (!x || !x.error) {
          this.requests = this.requests.filter(f => f.id != user.id);
          // this.followers.push(user);

          // this.user.followers_number += 1;
        }
      });
  }

  public rejectUser(user: User): void {
    this.followService.rejectFollowRequest(user.id).subscribe(x =>
      {
        if (!x || !x.error) {
          this.requests = this.requests.filter(f => f.id != user.id);
        }
      });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loadMoreIfNoScroll();
  }

  loadMoreIfNoScroll() {
    const w : any = window;

    if (w.scrollMaxY == 0) {
      this.loadRequests(1);
    }
  }
}
