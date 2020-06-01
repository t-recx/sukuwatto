import { Component, OnInit, OnDestroy } from '@angular/core';
import { WorkoutsService } from '../workouts.service';
import { Workout } from '../workout';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute } from '@angular/router';
import { RepetitionType } from '../plan-session-group-activity';
import { Paginated } from '../paginated';
import { Subscription } from 'rxjs';
import { faTasks } from '@fortawesome/free-solid-svg-icons';

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

  getWorkouts(username, pageParameter: any): void {
    if (!pageParameter) {
      pageParameter = 1;
    }

    if (!username || username.length == 0) {
      username = this.authService.getUsername();
    }

    if (username) {
      this.loading = true;
      this.workoutsService.getWorkouts(username, pageParameter, this.pageSize)
        .subscribe(paginated => {
          this.paginatedWorkouts = paginated;
          this.workouts = paginated.results;
          this.currentPage = Number(pageParameter);
          this.loading = false;
        });
    }
  }

  deleteWorkout(workout): void {
    this.workoutsService.deleteWorkout(workout).subscribe(_ => this.getWorkouts(this.username, this.page));
  }
}
