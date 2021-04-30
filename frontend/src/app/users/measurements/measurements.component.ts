import { Component, HostListener, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { faWeight } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AlertService } from 'src/app/alert/alert.service';
import { AuthService } from 'src/app/auth.service';
import { ErrorService } from 'src/app/error.service';
import { User } from 'src/app/user';
import { UserService } from 'src/app/user.service';
import { LoadingService } from '../loading.service';
import { Paginated } from '../paginated';
import { UnitsService } from '../units.service';
import { UserVisibleChartData } from '../user-available-chart-data';
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

  show404: boolean = false;
  show403: boolean = false;
  userIsCurrentUserLoggedIn: boolean = false;
  user: User = null;
  loading: boolean = false;
  username: string;
  page: number;
  pageSize: number = 10;
  ordering: string;
  measurements: UserBioData[] = [];
  paginatedMeasurements: Paginated<UserBioData>;

  chartDataVisibility = new UserVisibleChartData({
    show_bio_data_records: true,
    show_weight_records: true
  });

  link: any;

  queryParams: {};

  sortIndex = 0;
  columnOrder = {};

  chartsVisible = false;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setChartVisibility();
  }

  setChartVisibility() {
    this.chartsVisible = !this.authService.isCurrentUserLoggedIn(this.username) || window.innerWidth <= 1280;
  }

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
    private usersService: UserService,
  ) {
    this.paramChangedSubscription = combineLatest(route.paramMap, route.queryParamMap)
      .pipe(map(results => ({ params: results[0], query: results[1] })))
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
      this.ordering.split(',').forEach(o => {
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
    this.setChartVisibility();
  }

  loadParameterDependentData(username: string, page: string, ordering: string) {
    this.username = username;
    this.link = ['/users', this.username, 'measurements'];
    this.page = +page;
    this.ordering = ordering;
    this.queryParams = this.getQueryParams();
    this.orderingToColumnOrder();
    this.setChartVisibility();

    this.loadMeasurements();
  }

  loadMeasurements() {
    this.loading = true;

    if (!this.page) {
      this.page = 1;
    }

    this.loadingService.load();
    this.userIsCurrentUserLoggedIn = this.authService.isCurrentUserLoggedIn(this.username);

    this.usersService.getUser(this.username).subscribe(user => {
      this.user = user;
      this.show404 = !user;
      this.show403 = user && user.hidden && !this.userIsCurrentUserLoggedIn;
      if (this.user != null && !this.user.hidden) {
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

            if (paginated.results) {
              paginated.results.forEach(r => this.unitsService.convertUserBioData(r));
            }

            this.measurements = paginated.results ? paginated.results : [];
            
            this.loading = false;
            this.loadingService.unload();
          });
      }
      else {
        this.loadingService.unload();
        this.loading = false;
      }
    });
  }

  getQueryParams() {
    let queryParams = {}

    if (this.ordering) {
      queryParams['ordering'] = this.ordering;
    }

    return queryParams;
  }

  navigate(measurement) {
    this.router.navigate(['/users', this.username, 'measurement', measurement.id]);
  }

}
