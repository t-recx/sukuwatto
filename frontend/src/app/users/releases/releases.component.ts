import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReleasesService } from '../releases.service';
import { Release, ReleaseState } from '../release';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RepetitionType } from '../plan-session-group-activity';
import { Paginated } from '../paginated';
import { combineLatest, fromEvent, of, Subscription } from 'rxjs';
import { faBackspace, faCode, faBoxOpen, faSearch, faTasks } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ErrorService } from 'src/app/error.service';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-releases',
  templateUrl: './releases.component.html',
  styleUrls: ['./releases.component.css']
})
export class ReleasesComponent implements OnInit, OnDestroy {

  faBackspace = faBackspace;
  faBoxOpen = faBoxOpen;

  paramChangedSubscription: Subscription;

  paginatedReleases: Paginated<Release>;
  releases: Release[];

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
    private releasesService: ReleasesService,
    private authService: AuthService,
    public route: ActivatedRoute, 
    private loadingService: LoadingService,
    private alertService: AlertService,
    private errorService: ErrorService,
    private router: Router,
  ) { 
    this.paramChangedSubscription = this.route.paramMap.subscribe(params => {
        this.loadParameterDependentData(params.get('username'), params.get('page'));
    });
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  isAdmin() {
    return this.authService.userIsStaff();
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  loadParameterDependentData(username: string, page: string): void {
    this.username = username;
    this.page = page;
    this.getReleases(page);
  }

  getReleases(pageParameter: any, reloadOn404: boolean = false): void {
    if (!pageParameter) {
      pageParameter = 1;
    }

    this.loading = true;
    this.loadingService.load();

    this.releasesService
      .getReleases(pageParameter, this.pageSize)
      .pipe(
        catchError(this.errorService.handleError<Paginated<Release>>('getReleases', (e: any) => {
          if (e.status && e.status == 404 && pageParameter > 1) {
            if (reloadOn404) {
              this.router.navigate(['/users', this.username, 'releases', pageParameter - 1]);
            }
          }
          else {
            this.alertService.error('Unable to fetch releases');
          }
        }, new Paginated<Release>()))
      )
      .subscribe(paginated => {
        this.paginatedReleases = paginated;
        this.releases = paginated.results;
        this.currentPage = Number(pageParameter);
        this.loading = false;

        this.loadingService.unload();
      });
  }
}

