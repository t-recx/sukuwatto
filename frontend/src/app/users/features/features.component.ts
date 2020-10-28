import { Component, OnInit, OnDestroy } from '@angular/core';
import { FeaturesService } from '../features.service';
import { Feature } from '../feature';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RepetitionType } from '../plan-session-group-activity';
import { Paginated } from '../paginated';
import { combineLatest, fromEvent, of, Subscription } from 'rxjs';
import { faBackspace, faCode, faFileCode, faSearch, faTasks } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ErrorService } from 'src/app/error.service';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit, OnDestroy {

  faBackspace = faBackspace;
  faCode = faCode;

  paramChangedSubscription: Subscription;
  searchSubscription: Subscription;

  searchFilter: string;
  queryParams: {};

  paginatedFeatures: Paginated<Feature>;
  features: Feature[];

  username: string;
  page: string;

  faTasks = faTasks;
  currentPage: number;

  pageSize: number = 10;
  repetitionType = RepetitionType;

  loading: boolean = false;
  faSearch = faSearch;

  lastSearchedFilter = '';

  constructor(
    private featuresService: FeaturesService,
    private authService: AuthService,
    public route: ActivatedRoute, 
    private loadingService: LoadingService,
    private alertService: AlertService,
    private errorService: ErrorService,
    private router: Router,
  ) { 
    this.paramChangedSubscription = combineLatest(this.route.paramMap, this.route.queryParamMap)
    .pipe(map(results => ({params: results[0], query: results[1]})))
    .subscribe(results => {
        this.searchFilter = results.query.get('search');
        this.loadParameterDependentData(results.params.get('username'), results.params.get('page'));
    });
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.lastSearchedFilter = '';
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
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

  loadParameterDependentData(username: string, page: string): void {
    this.username = username;
    this.page = page;
    this.getFeatures(page);
  }

  getFeatures(pageParameter: any, reloadOn404: boolean = false): void {
    if (!pageParameter) {
      pageParameter = 1;
    }

    this.loading = true;
    this.loadingService.load();

    this.queryParams = this.getQueryParams();

    this.featuresService
      .getFeatures(pageParameter, this.pageSize, this.searchFilter)
      .pipe(
        catchError(this.errorService.handleError<Paginated<Feature>>('getFeatures', (e: any) => {
          if (e.status && e.status == 404 && pageParameter > 1) {
            if (reloadOn404) {
              this.router.navigate(['/users', this.username, 'features', pageParameter - 1]);
            }
          }
          else {
            this.alertService.error('Unable to fetch features');
          }
        }, new Paginated<Feature>()))
      )
      .subscribe(paginated => {
        this.paginatedFeatures = paginated;
        this.features = paginated.results;
        this.currentPage = Number(pageParameter);
        this.loading = false;

        this.lastSearchedFilter = this.searchFilter;
        this.loadingService.unload();
      });
  }

  search() {
    if (this.lastSearchedFilter != this.searchFilter) {
      this.currentPage = 1;
    }

    this.queryParams = this.getQueryParams();
    const navigatedLink = ['/users', this.username, 'features'];

    if (this.currentPage && this.currentPage > 1) {
      navigatedLink.push(this.currentPage.toString());
    }

    this.router.navigate(navigatedLink, { queryParams: this.getQueryParams() });
  }

  clearFilters() {
    this.searchFilter = '';
    this.search();
  }

  getQueryParams() {
    let queryParams = {}
    
    if (this.searchFilter && this.searchFilter.length > 0) {
      queryParams['search']= this.searchFilter;
    }

    return queryParams;
  }

  deleteFeature(feature): void {
    this.getFeatures(this.page, true);
  }
}

