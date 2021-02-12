import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faSearch, faBackspace } from '@fortawesome/free-solid-svg-icons';
import { Subscription, fromEvent, of, combineLatest } from 'rxjs';
import { catchError, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AlertService } from 'src/app/alert/alert.service';
import { ErrorService } from 'src/app/error.service';
import { LeaderboardPosition, LeaderboardTimespan } from '../leaderboard-position';
import { LeaderboardService } from '../leaderboard.service';
import { LoadingService } from '../loading.service';
import { Paginated } from '../paginated';

@Component({
  selector: 'app-leaderboard-list',
  templateUrl: './leaderboard-list.component.html',
  styleUrls: ['./leaderboard-list.component.css']
})
export class LeaderboardListComponent implements OnInit, OnDestroy {
  page: number;
  pageSize: number = 10;
  link: any;
  queryParams: {};
  positionType: string;
  selectedLeaderboardTimespan: LeaderboardTimespan = LeaderboardTimespan.Week;
  leaderboardTimespan = LeaderboardTimespan;

  username: string;
  faSearch = faSearch;
  faBackspace = faBackspace;

  searchFilter: string;
  lastSearchedFilter = '';

  positions: LeaderboardPosition[] = [];

  paramChangedSubscription: Subscription;
  paginatedPositions: Paginated<LeaderboardPosition>;
  searchSubscription: Subscription;
  queryParamChangedSubscription: Subscription;

  constructor(
    private leaderboardService: LeaderboardService,
    private router: Router,
    private loadingService: LoadingService,
    private errorService: ErrorService,
    private alertService: AlertService,
    route: ActivatedRoute,
  ) {
    this.paramChangedSubscription = combineLatest(route.paramMap, route.queryParamMap)
    .pipe(map(results => ({params: results[0], query: results[1]})))
    .subscribe(results => {
        this.loadParameterDependentData(results.params.get('username'),results.params.get('page'),
        results.query.get('search'), results.query.get('timespan'));
    });
  }

  loadParameterDependentData(username: string, page: string, search: string, timespan: string) {
    this.username = username;
    this.page = +page;
    this.searchFilter = search;
    this.queryParams = this.getQueryParams();

    if (timespan) {
      this.selectedLeaderboardTimespan = timespan as LeaderboardTimespan;
    }

    this.loadPositions();
  }

  ngOnInit(): void {
    this.lastSearchedFilter = '';
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  loadPositions() {
    if (!this.page) {
      this.page = 1;
    }

    this.loadingService.load();
    this.leaderboardService.get(this.selectedLeaderboardTimespan, this.page, this.pageSize, this.searchFilter)
    .pipe(
      catchError(this.errorService.handleError<Paginated<LeaderboardPosition>>('get', (e: any) => {
        if (e.status && e.status == 404 && this.page > 1) {
          this.alertService.error('Unable to fetch leaderboard positions: no leaderboard positions on specified page');
        }
        else {
          this.alertService.error('Unable to fetch leaderboard positions');
        }
      }, new Paginated<LeaderboardPosition>()))
    )
      .subscribe(paginated => {
        this.paginatedPositions = paginated;
        this.positions = paginated.results ? paginated.results : [];

        this.lastSearchedFilter = this.searchFilter;
        this.loadingService.unload();
    });
  }

  search() {
    if (this.lastSearchedFilter != this.searchFilter) {
      this.page = 1;
    }

    this.queryParams = this.getQueryParams();
    let navigatedLink = ['/users', this.username, 'leaderboards'];

    if (this.page && this.page > 1) {
      navigatedLink.push(this.page.toString());
    }

    this.router.navigate(navigatedLink, { queryParams: this.getQueryParams() });
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

  clearFilters(): void {
    this.searchFilter = '';
    this.search();
  }

  getQueryParams() {
    let queryParams = {}
    
    if (this.searchFilter && this.searchFilter.length > 0) {
      queryParams['search']= this.searchFilter;
    }

    if (this.selectedLeaderboardTimespan != LeaderboardTimespan.Week) {
      queryParams['timespan'] = this.selectedLeaderboardTimespan;
    }

    return queryParams;
  }

  changeTimespan(timespan: LeaderboardTimespan) {
    if (timespan != this.selectedLeaderboardTimespan) {
      this.selectedLeaderboardTimespan = timespan;
      this.search();
    }
  }
}
