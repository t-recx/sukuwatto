import { Component, OnInit, OnDestroy, AfterContentInit, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Plan } from '../plan';
import { PlansService } from '../plans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faBackspace, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth.service';
import { LoadingService } from '../loading.service';
import { CordovaService } from 'src/app/cordova.service';
import { Subscription, forkJoin, of, Observable, combineLatest } from 'rxjs';
import { SerializerUtilsService } from 'src/app/serializer-utils.service';
import { UnitsService } from '../units.service';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { Paginated } from '../paginated';
import { ErrorService } from 'src/app/error.service';
import { AlertService } from 'src/app/alert/alert.service';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() isPublic: boolean;
  @Input() isOwned: boolean;
  @Input() isAdopted: boolean;

  queryParams: any;
  hasOwnedPlans: boolean = true;
  hasAdoptedPlans: boolean = true;
  link: any;
  page: number;

  lastSearchedFilter: string;
  searchFilter: string;

  specificPath: string = 'plans';
  paginatedPlans: Paginated<Plan>;
  plans: Plan[] = [];

  pageSize: number = 10;
  currentPage: number;

  username: string;
  faCalendarAlt = faCalendarAlt;
  faBackspace = faBackspace;

  loading: boolean = false;
  searchSubscription: Subscription;
  pausedSubscription: Subscription;
  paramChangedSubscription: Subscription;

  isCurrentLoggedInUser: boolean = true;

  constructor(
    private plansService: PlansService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private loadingService: LoadingService,
    private cordovaService: CordovaService,
    private unitsService: UnitsService,
    private errorService: ErrorService,
    private alertService: AlertService,
    private serializerUtils: SerializerUtilsService,
  ) {
   }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isPublic) {
      this.specificPath = 'plans';
    }
    if (this.isAdopted) {
      this.specificPath = 'adopted-plans';
    }
    if (this.isOwned) {
      this.specificPath = 'owned-plans';
    }

    this.setLink();
  }

  setLink() {
    this.link = ['/users', this.username, this.specificPath];
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.lastSearchedFilter = '';
    this.setupSearch();

    this.username = this.route.snapshot.paramMap.get('username');
    this.setLink();
    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.serialize());

    this.paramChangedSubscription = combineLatest(this.route.paramMap, this.route.queryParamMap)
    .pipe(map(results => ({params: results[0], query: results[1]})))
    .subscribe(results => {
        this.loadParameterDependentData(results.params.get('username'), results.params.get('page'), results.query.get('search'));
    });
  }

  ngAfterViewInit(): void {
    this.serializerUtils.restoreScrollPosition();
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
    this.pausedSubscription.unsubscribe();

    localStorage.removeItem('state_plans_has_state');
    localStorage.removeItem('state_plans_plans');
    this.serializerUtils.removeScrollPosition();
  }

  serialize() {
    localStorage.setItem('state_plans_has_state', JSON.stringify(true));
    localStorage.setItem('state_plans_plans', JSON.stringify(this.plans));
    this.serializerUtils.serializeScrollPosition();
  }

  restore(): boolean {
    const hasState = JSON.parse(localStorage.getItem('state_plans_has_state'));

    if (!hasState) {
      return false;
    }

    const statePlans = localStorage.getItem('state_plans_plans');

    this.plans = this.plansService.getProperlyTypedPlans(JSON.parse(statePlans));

    return true;
  }

  loadParameterDependentData(username: string, page: any, searchFilter: any, reloadOn404: boolean = false): void {
    this.isCurrentLoggedInUser = this.authService.isCurrentUserLoggedIn(username);
    this.username = username;

    if (this.restore()) {
      return;
    }

    this.plans = [];
    this.loadPlans(this.username, page, searchFilter, reloadOn404);
  }

  loadPlans(username: string, page: any, searchFilter: any, reloadOn404: boolean = false) {
    if (!page) {
      page = 1;
    }

    page = +page;
    this.page = page;

    this.searchFilter = searchFilter;
    this.loading = true;
    this.loadingService.load();
    let obsPlans: Observable<Paginated<Plan>>;

    if (this.isPublic) {
      obsPlans = this.plansService.getPublicPlans(null, page, this.pageSize, searchFilter);
    }
    else if (this.isAdopted) {
      obsPlans = this.plansService.getAdoptedPlansPaginated(this.username, page, this.pageSize, searchFilter);
    }
    else if (this.isOwned) {
      obsPlans = this.plansService.getOwnedPlansPaginated(this.username, page, this.pageSize, searchFilter);
    }

    this.queryParams = this.getQueryParams();

    obsPlans
    .pipe(
      catchError(this.errorService.handleError<Paginated<Plan>>('getPlans', (e: any) =>
      {
        if (e.status && e.status == 404 && page > 1)  {
          if (reloadOn404) {
            this.router.navigate(['/users', username, this.specificPath, page - 1]);
          }
        }
        else {
          this.alertService.error('Unable to fetch plans');
        }
      }, new Paginated<Plan>()))
    )
    .subscribe(paginatedPlans => {
      this.currentPage = Number(page);
      this.paginatedPlans = paginatedPlans;
      this.plans = paginatedPlans.results;

      this.loading = false;
      this.lastSearchedFilter = this.searchFilter;
      this.loadingService.unload();
    });
  }

  showDeleteButton(plan: Plan): boolean {
    return this.authService.isCurrentUserLoggedIn(plan.user.username);
  }

  deletePlan(plan): void {
    this.plansService.deletePlan(plan).subscribe(_ => 
      this.loadParameterDependentData(this.username, this.currentPage, this.searchFilter, true));
  }

  planAdopted() {
    this.router.navigate(['/users', this.authService.getUsername(), 'adopted-plans']);
  }

  planLeft() {
    if ((!this.currentPage || this.currentPage == 1) &&
      this.username == this.authService.getUsername()) {
      window.scroll(0,0);
      this.loadParameterDependentData(this.username, 1, this.searchFilter);
    }
    else {
      this.router.navigate(['/users', this.authService.getUsername(), 'adopted-plans']);
    }
  }

  search() {
    if (this.lastSearchedFilter != this.searchFilter) {
      this.page = 1;
    }

    const navigatedLink = this.link;

    if (this.page && this.page > 1) {
      navigatedLink.push(this.page.toString());
    }

    this.queryParams = this.getQueryParams();

    this.router.navigate(navigatedLink, { queryParams: this.getQueryParams() });
  }

  clearFilters() {
    this.lastSearchedFilter = this.searchFilter = null;
    this.search();
  }

  getQueryParams() {
    let queryParams = {}
    
    if (this.searchFilter && this.searchFilter.length > 0) {
      queryParams['search']= this.searchFilter;
    }

    return queryParams;
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
