import { Route } from '@angular/compiler/src/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faBackspace } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, fromEvent, of, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { AlertService } from 'src/app/alert/alert.service';
import { ErrorService } from 'src/app/error.service';
import { User } from 'src/app/user';
import { UserService } from 'src/app/user.service';
import { LoadingService } from '../loading.service';
import { Paginated } from '../paginated';

@Component({
  selector: 'app-users-search',
  templateUrl: './users-search.component.html',
  styleUrls: ['./users-search.component.css']
})
export class UsersSearchComponent implements OnInit, OnDestroy {
  loading = false;
  lastSearchedFilter: string;
  searchFilter: string;
  users: User[];
  paginatedUsers: Paginated<User>;
  currentPage: number;
  pageSize: number = 10;
  username: string;
  queryParams: any;

  searchSubscription: Subscription;
  paramChangedSubscription: Subscription;

  faBackspace = faBackspace;

  constructor(
    private alertService: AlertService,
    private errorService: ErrorService,
    private usersService: UserService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router,
  ) { 
    this.paramChangedSubscription = combineLatest(this.route.paramMap, this.route.queryParamMap)
    .pipe(map(results => ({params: results[0], query: results[1]})))
    .subscribe(results => {
      this.username = results.params.get('username');
      this.searchFilter = results.query.get('search');
      this.loadParameterDependentData(results.params.get('page'));
    });
  }

  clearFilters() {
    this.searchFilter = '';
    this.search();
  }

  ngOnInit(): void {
    this.lastSearchedFilter = '';
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
  }

  getQueryParams() {
    let queryParams = {}
    
    if (this.searchFilter && this.searchFilter.length > 0) {
      queryParams['search']= this.searchFilter;
    }

    return queryParams;
  }

  search() {
    if (this.lastSearchedFilter != this.searchFilter) {
      this.currentPage = 1;
    }

    this.queryParams = this.getQueryParams();
    const navigatedLink = ['/users', this.username, 'search-users'];

    if (this.currentPage && this.currentPage > 1) {
      navigatedLink.push(this.currentPage.toString());
    }

    this.router.navigate(navigatedLink, { queryParams: this.getQueryParams() });
  }

  loadParameterDependentData(pageParameter: any, reloadOn404: boolean = false) {
    if (!this.searchFilter || this.searchFilter.trim().length == 0) {
      this.users = null;
      return;
    }

    if (!pageParameter) {
      pageParameter = 1;
    }

    this.loading = true;
    this.loadingService.load();

    this.queryParams = this.getQueryParams();

    this.usersService.search(pageParameter, this.pageSize, this.searchFilter).pipe(
        catchError(this.errorService.handleError<Paginated<User>>('searchUsers', (e: any) => 
        { 
          if (e.status && e.status == 404 && pageParameter > 1)  {
            if (reloadOn404) {
              this.router.navigate(['/users', this.username, 'search-users', pageParameter-1]);
            }
          }
          else {
            this.alertService.error('Unable to fetch users');
          }
        }, new Paginated<User>()))
    )
    .subscribe(paginated => {
      this.paginatedUsers = paginated;
      this.users = paginated.results;
      this.currentPage = Number(pageParameter);
      this.lastSearchedFilter = this.searchFilter;
      this.loading = false;
      this.loadingService.unload();
    });
  }

  setupSearch() {
    const searchBox = document.getElementById('search-input');

    const typeahead = fromEvent(searchBox, 'input').pipe(
      map((e: KeyboardEvent) => (e.target as HTMLInputElement).value),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(() => of(true))
    );

    this.searchSubscription = typeahead.subscribe(() => {
      this.search();
    });
  }

}
