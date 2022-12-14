import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { WorkoutsService } from '../workouts.service';
import { Workout } from '../workout';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RepetitionType } from '../plan-session-group-activity';
import { Paginated } from '../paginated';
import { combineLatest, fromEvent, of, Subscription } from 'rxjs';
import { faBackspace, faSearch, faTasks } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ErrorService } from 'src/app/error.service';
import { AlertService } from 'src/app/alert/alert.service';
import { UserVisibleChartData } from '../user-available-chart-data';
import { UserService } from 'src/app/user.service';
import { User } from 'src/app/user';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.component.html',
  styleUrls: ['./workouts.component.css']
})
export class WorkoutsComponent implements OnInit, OnDestroy {
  paramChangedSubscription: Subscription;
  searchSubscription: Subscription;

  show404: boolean = false;
  show403: boolean = false;
  userIsCurrentUserLoggedIn: boolean = false;
  user: User = null;
  toDate: Date;
  fromDate: Date;
  lastFromDateFilter: Date;
  lastToDateFilter: Date;

  searchFilter: string;
  queryParams: {};

  paginatedWorkouts: Paginated<Workout>;
  workouts: Workout[];

  username: string;
  page: string;

  faTasks = faTasks;
  currentPage: number;

  pageSize: number = 10;
  repetitionType = RepetitionType;

  loading: boolean = false;
  faSearch = faSearch;
  faBackspace = faBackspace;

  lastSearchedFilter = '';

  chartDataVisibility = new UserVisibleChartData({
    show_compound_exercises: true,
    show_distance_exercises: true,
    show_distance_exercises_last_month: true,
    show_isolation_exercises: true
  });

  chartsVisible = false;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setChartVisibility();
  }

  setChartVisibility() {
    this.chartsVisible = !this.authService.isCurrentUserLoggedIn(this.username) || window.innerWidth <= 1280;
  }

  constructor(
    private workoutsService: WorkoutsService,
    private authService: AuthService,
    public route: ActivatedRoute,
    private loadingService: LoadingService,
    private alertService: AlertService,
    private errorService: ErrorService,
    private router: Router,
    private usersService: UserService,
  ) {
    this.paramChangedSubscription = combineLatest(this.route.paramMap, this.route.queryParamMap)
      .pipe(map(results => ({ params: results[0], query: results[1] })))
      .subscribe(results => {
        this.searchFilter = results.query.get('search');
        this.fromDate = results.query.get('from') ? new Date(results.query.get('from')) : null;
        this.toDate = results.query.get('to') ? new Date(results.query.get('to')) : null;
        this.loadParameterDependentData(results.params.get('username'), results.params.get('page'));
      });
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.setChartVisibility();
    this.lastSearchedFilter = '';
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  setupSearch() {
    const searchBox = document.getElementById('search-input');

    if (searchBox) {
      const typeahead = fromEvent(searchBox, 'input').pipe(
        map((e: KeyboardEvent) => (e.target as HTMLInputElement).value),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(() => of(true))
      );

      if (this.searchSubscription) {
        this.searchSubscription.unsubscribe();
      }

      this.searchSubscription = typeahead.subscribe(() => {
        this.search();
      });
    }
  }

  loadParameterDependentData(username: string, page: string): void {
    this.username = username;
    this.page = page;
    this.workouts = [];
    this.setChartVisibility();
    this.getWorkouts(username, page);
  }

  getWorkouts(username, pageParameter: any, reloadOn404: boolean = false): void {
    if (!pageParameter) {
      pageParameter = 1;
    }

    if (username) {
      this.userIsCurrentUserLoggedIn = this.authService.isCurrentUserLoggedIn(username);
      this.loading = true;
      this.loadingService.load();

      this.queryParams = this.getQueryParams();

      this.usersService.getUser(username).subscribe(user => {
        this.user = user;
        this.show404 = !user;
        this.show403 = user && user.hidden && !this.userIsCurrentUserLoggedIn;

        if (this.user != null && !this.user.hidden) {
          this.workoutsService
            .getWorkoutsOverview(username, pageParameter, this.pageSize, this.searchFilter, this.fromDate, this.toDate)
            .pipe(
              catchError(this.errorService.handleError<Paginated<Workout>>('getWorkouts', (e: any) => {
                if (e.status && e.status == 404 && pageParameter > 1) {
                  if (reloadOn404) {
                    this.router.navigate(['/users', username, 'workouts', pageParameter - 1]);
                  }
                }
                else {
                  this.alertService.error('Unable to fetch workouts');
                }
              }, new Paginated<Workout>()))
            )
            .subscribe(paginated => {
              this.paginatedWorkouts = paginated;
              this.workouts = paginated.results;
              this.currentPage = Number(pageParameter);
              this.loading = false;

              this.lastSearchedFilter = this.searchFilter;
              this.lastFromDateFilter = this.fromDate;
              this.lastToDateFilter = this.toDate;

              setTimeout(() => this.setupSearch());
              this.loadingService.unload();
            });
        }
        else {
          this.loading = false;
          this.loadingService.unload();
        }
      });
    }
    else {
      this.show404 = true;
    }
  }

  search() {
    if (this.lastSearchedFilter != this.searchFilter ||
      this.lastFromDateFilter != this.fromDate ||
      this.lastToDateFilter != this.toDate) {
      this.currentPage = 1;
    }

    this.queryParams = this.getQueryParams();
    const navigatedLink = ['/users', this.username, 'workouts'];

    if (this.currentPage && this.currentPage > 1) {
      navigatedLink.push(this.currentPage.toString());
    }

    this.router.navigate(navigatedLink, { queryParams: this.getQueryParams() });
  }

  setFilterFromDate(e) {
    if (e) {
      this.fromDate = new Date(e);
    }
    else {
      this.fromDate = null;
    }

    this.search();
  }

  setFilterToDate(e) {
    if (e) {
      this.toDate = new Date(e);
    }
    else {
      this.toDate = null;
    }

    this.search();
  }

  clearFilters() {
    this.searchFilter = '';
    this.fromDate = null;
    this.toDate = null;
    this.search();
  }

  getQueryParams() {
    let queryParams = {}

    if (this.searchFilter && this.searchFilter.length > 0) {
      queryParams['search'] = this.searchFilter;
    }

    if (this.fromDate) {
      queryParams['from'] = this.fromDate.toISOString();
    }

    if (this.toDate) {
      queryParams['to'] = this.toDate.toISOString();
    }

    return queryParams;
  }

  deleteWorkout(workout): void {
    this.workoutsService.deleteWorkout(workout)
      .subscribe(_ => this.getWorkouts(this.username, this.page, true));
  }

  isOwner(workout: Workout) {
    return this.authService.isCurrentUserLoggedIn(workout.user.username);
  }
}
