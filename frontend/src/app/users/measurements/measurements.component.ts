import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { faWeight } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AlertService } from 'src/app/alert/alert.service';
import { AuthService } from 'src/app/auth.service';
import { ErrorService } from 'src/app/error.service';
import { LoadingService } from '../loading.service';
import { Paginated } from '../paginated';
import { UnitsService } from '../units.service';
import { UserBioData } from '../user-bio-data';
import { UserBioDataService } from '../user-bio-data.service';

@Component({
  selector: 'app-measurements',
  templateUrl: './measurements.component.html',
  styleUrls: ['./measurements.component.css']
})
export class MeasurementsComponent implements OnInit, OnDestroy {

  faWeight = faWeight;

  paramChangedSubscription: Subscription;
  queryParamChangedSubscription: Subscription;

  username: string;
  page: number;
  pageSize: number = 10;
  ordering: string;
  measurements: UserBioData[] = [];
  paginatedMeasurements: Paginated<UserBioData>;

  link: any;

  queryParams: {};

  sortIndex = 0;
  columnOrder = {};

  getUnitCode(id: number): string {
    return this.unitsService.getUnitCode(id);
  }

  constructor(
    private alertService: AlertService,
    private errorService: ErrorService,
    private authService: AuthService,
    private router: Router,
    private unitsService: UnitsService,
    private loadingService: LoadingService,
    private measurementsService: UserBioDataService,
    route: ActivatedRoute,
  ) { 
    this.paramChangedSubscription = combineLatest(route.paramMap, route.queryParamMap)
    .pipe(map(results => ({params: results[0], query: results[1]})))
    .subscribe(results => {
      this.loadParameterDependentData(results.params.get('username'), results.params.get('page'), results.query.get('ordering'));
    });
  }

  measurementTracker(index, item) {
    return item.id;
  }

  toggleSort(column: string) {
    if (!this.columnOrder[column]) {
      this.sortIndex++;
      this.columnOrder[column] = [this.sortIndex, column];
    }
    else if (this.columnOrder[column][1][0] == '-') {
      this.columnOrder[column] = null;
    }
    else {
      this.columnOrder[column][1] = '-' + this.columnOrder[column][1];
    }

    this.ordering = Object.values(this.columnOrder).filter(x => x).sort((a, b) => a[0] - b[0]).map(x => x[1]).join(',');
    this.search();

    if (Object.values(this.columnOrder).filter(x => x).length == 0) {
      this.sortIndex = 0;
    }
  }

  search() {
    this.queryParams = this.getQueryParams();
    let navigatedLink = this.link;

    if (this.page && this.page > 1) {
      navigatedLink.push(this.page.toString());
    }

    this.router.navigate(navigatedLink, { queryParams: this.getQueryParams() });
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  orderingToColumnOrder() {
    if (this.ordering) {
      this.ordering.split(',').forEach(o => 
        {
          let columnName = o;
          if (o[0] == '-') {
            columnName = o.substr(1);
          }
          this.columnOrder[columnName] = [this.sortIndex, o];
          this.sortIndex++;
        });
    }
    else {
      this.columnOrder = {};
    }
  }

  ngOnInit() {
  }

  loadParameterDependentData(username: string, page: string, ordering: string) {
    this.username = username;
    this.link = ['/users', this.username, 'measurements'];
    this.page = +page;
    this.ordering = ordering;
    this.queryParams = this.getQueryParams();
    this.orderingToColumnOrder();

    this.loadMeasurements();
  }

  loadMeasurements() {
    if (!this.page) {
      this.page = 1;
    }

    this.loadingService.load();
    this.measurementsService.getUserBioDatas(this.username, this.page, this.pageSize, this.ordering)
    .pipe(
      catchError(this.errorService.handleError<Paginated<UserBioData>>('getMeasurements', (e: any) => {
        if (e.status && e.status == 404 && this.page > 1) {
          this.alertService.error('Unable to fetch measurements: no measurements on specified page');
        }
        else {
          this.alertService.error('Unable to fetch measurements');
        }
      }, new Paginated<UserBioData>()))
    )
      .subscribe(paginated => {
        this.paginatedMeasurements = paginated;
        this.measurements = paginated.results ? paginated.results : [];

        this.loadingService.unload();
    });
  }

  getQueryParams() {
    let queryParams = {}
    
    if (this.ordering) {
      queryParams['ordering']= this.ordering;
    }

    return queryParams;
  }

  navigate(measurement) {
    this.router.navigate(['/users', this.username, 'measurement', measurement.id]);
  }

}
