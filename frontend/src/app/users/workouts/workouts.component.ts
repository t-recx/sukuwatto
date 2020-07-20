import { Component, OnInit, OnDestroy } from '@angular/core';
import { WorkoutsService } from '../workouts.service';
import { Workout } from '../workout';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RepetitionType } from '../plan-session-group-activity';
import { Paginated } from '../paginated';
import { Subscription } from 'rxjs';
import { faTasks } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { catchError } from 'rxjs/operators';
import { ErrorService } from 'src/app/error.service';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.component.html',
  styleUrls: ['./workouts.component.css']
})
export class WorkoutsComponent implements OnInit, OnDestroy {
  paramChangedSubscription: Subscription;
  paginatedWorkouts: Paginated<Workout>;
  workouts: Workout[];

  username: string;
  page: string;

  faTasks = faTasks;
  currentPage: number;

  pageSize: number = 10;
  repetitionType = RepetitionType;

  loading: boolean = false;

  constructor(
    private workoutsService: WorkoutsService,
    private authService: AuthService,
    public route: ActivatedRoute, 
    private loadingService: LoadingService,
    private alertService: AlertService,
    private errorService: ErrorService,
    private router: Router,
  ) { 
    this.paramChangedSubscription = route.paramMap.subscribe(val =>
      {
        this.loadParameterDependentData(val.get('username'), val.get('page'));
      });
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  loadParameterDependentData(username: string, page: string): void {
    this.username = username;
    this.page = page;
    this.getWorkouts(username, page);
  }

  getWorkouts(username, pageParameter: any, reloadOn404: boolean = false): void {
    if (!pageParameter) {
      pageParameter = 1;
    }

    if (!username || username.length == 0) {
      username = this.authService.getUsername();
    }

    if (username) {
      this.loading = true;
      this.loadingService.load();
      this.workoutsService
      .getWorkouts(username, pageParameter, this.pageSize)
      .pipe(
        catchError(this.errorService.handleError<Paginated<Workout>>('getWorkouts', (e: any) => 
        { 
          if (e.status && e.status == 404 && pageParameter > 1)  {
            if (reloadOn404) {
              this.router.navigate(['/users', username, 'workouts', pageParameter-1]);
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
          this.loadingService.unload();
        });
    }
  }

  deleteWorkout(workout): void {
    this.workoutsService.deleteWorkout(workout)
    .subscribe(_ => this.getWorkouts(this.username, this.page, true));
  }
}
