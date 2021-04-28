import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertService } from 'src/app/alert/alert.service';
import { AuthService } from 'src/app/auth.service';
import { ErrorService } from 'src/app/error.service';
import { LoadingService } from '../loading.service';
import { Paginated } from '../paginated';
import { Report, ReportState } from '../report';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isOpen: boolean;
  @Input() isClosed: boolean;
  @Input() isResolved: boolean;
  paramChangedSubscription: Subscription;

  loading: boolean = false;

  paginatedReports: Paginated<Report>;
  reports: Report[];

  page: string;
  username: string;

  currentPage: number;

  pageSize: number = 10;

  canView: boolean = false;

  specificPath: string;
  link: any;

  constructor(
    private loadingService: LoadingService,
    public route: ActivatedRoute,
    private reportService: ReportService,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private errorService: ErrorService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isOpen) {
      this.specificPath = 'reports';
    }
    else if (this.isClosed) {
      this.specificPath = 'closed-reports';
    }
    else if (this.isResolved) {
      this.specificPath = 'resolved-reports';
    }

    this.setLink();
  }

  setLink() {
    this.link = ['/users', this.username, this.specificPath];
  }

  ngOnInit(): void {
    this.username = this.route.snapshot.paramMap.get('username');
    this.setLink();

    this.paramChangedSubscription = this.route.paramMap.subscribe(params => {
      this.loadParameterDependentData(params.get('page'));
    });
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  loadParameterDependentData(page: string): void {
    this.canView = this.authService.isLoggedIn() && this.authService.userIsStaff();

    this.page = page;
    this.reports = [];
    this.getReports(page);
  }

  refresh() {
    this.getReports(this.page, true);
  }

  getReports(pageParameter: any, reloadOn404: boolean = false): void {
    if (!pageParameter) {
      pageParameter = 1;
    }

    this.loading = true;
    this.loadingService.load();

    let filterState = ReportState.Open;

    if (this.isClosed) {
      filterState = ReportState.Closed;
    }
    else if (this.isResolved) {
      filterState = ReportState.Resolved;
    }

    this.reportService
      .getReports(pageParameter, this.pageSize, filterState)
      .pipe(
        catchError(this.errorService.handleError<Paginated<Report>>('getReports', (e: any) => {
          if (e.status && e.status == 404 && pageParameter > 1) {
            if (reloadOn404) {
              this.router.navigate(['/users', this.authService.getUsername(), this.specificPath, pageParameter - 1]);
            }
          }
          else {
            this.alertService.error('Unable to fetch reports');
          }
        }, new Paginated<Report>()))
      )
      .subscribe(paginated => {
        this.paginatedReports = paginated;
        this.reports = paginated.results;
        this.currentPage = Number(pageParameter);
        this.loading = false;

        this.loadingService.unload();
      });
  }

}
