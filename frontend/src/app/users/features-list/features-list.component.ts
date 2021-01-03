import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FeaturesService } from '../features.service';
import { Feature, FeatureState } from '../feature';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Paginated } from '../paginated';
import { combineLatest, fromEvent, of, Subscription } from 'rxjs';
import { faBackspace, faCode, faFileCode, faSearch, faTasks } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ErrorService } from 'src/app/error.service';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-features-list',
  templateUrl: './features-list.component.html',
  styleUrls: ['./features-list.component.css']
})
export class FeaturesListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() page: number;
  @Input() pageSize: number = 10;
  @Input() searchFilter: string;
  @Input() ordering: string;
  @Input() link: any;
  @Input() queryParams: {};
  @Input() featureClickNavigates: boolean = true;
  @Input() username: string;
  @Output() selected = new EventEmitter<Feature>();

  faBackspace = faBackspace;
  faCode = faCode;

  paramChangedSubscription: Subscription;
  searchSubscription: Subscription;

  paginatedFeatures: Paginated<Feature>;
  features: Feature[];

  faTasks = faTasks;
  currentPage: number;

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
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.lastSearchedFilter = '';
    this.setupSearch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadFeatures();
  }

  ngOnDestroy(): void {
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

  loadFeatures(): void {
    this.getFeatures(this.page);
  }

  getFeatures(pageParameter: any, reloadOn404: boolean = false): void {
    if (!pageParameter) {
      pageParameter = 1;
    }

    this.loading = true;
    this.loadingService.load();

    this.queryParams = this.getQueryParams();

    this.featuresService
      .getFeatures(pageParameter, this.pageSize, this.searchFilter, FeatureState.Open)
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

    if (this.link) {
      this.queryParams = this.getQueryParams();
      const navigatedLink = this.link;

      if (this.currentPage && this.currentPage > 1) {
        navigatedLink.push(this.currentPage.toString());
      }

      this.router.navigate(navigatedLink, { queryParams: this.getQueryParams() });
    }
    else {
      this.loadFeatures();
    }
  }

  clearFilters() {
    this.searchFilter = '';
    this.search();
  }

  getQueryParams() {
    let queryParams = {};
    
    if (this.searchFilter && this.searchFilter.length > 0) {
      queryParams['search']= this.searchFilter;
    }

    return queryParams;
  }

  deleteFeature(feature): void {
    this.getFeatures(this.page, true);
  }

  navigateToPage(page: number) {
    if (!this.link) {
      this.page = page;
      this.loadFeatures();
    }
  }

  selectFeature(feature: Feature) {
    this.selected.emit(feature);
  }
}

