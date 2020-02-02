import { Component, OnInit, OnDestroy } from '@angular/core';
import { WorkoutsService } from '../workouts.service';
import { Workout } from '../workout';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Exercise } from '../exercise';
import { Unit, MeasurementType } from '../unit';
import { ExercisesService } from '../exercises.service';
import { UnitsService } from '../units.service';
import { WorkoutGroup } from '../workout-group';
import { RepetitionType } from '../plan-session-group-activity';
import { Paginated } from '../paginated';
import { Subscription } from 'rxjs';
import { faArrowRight, faArrowLeft, faDumbbell } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.component.html',
  styleUrls: ['./workouts.component.css']
})
export class WorkoutsComponent implements OnInit, OnDestroy {
  paramChangedSubscription: Subscription;
  paginatedWorkouts: Paginated<Workout>;
  workouts: Workout[];
  exercises: Exercise[];
  units: Unit[];

  username: string;
  page: string;

  faDumbbell = faDumbbell;
  currentPage: number;

  pageSize: number = 10;
  repetitionType = RepetitionType;

  constructor(
    private workoutsService: WorkoutsService,
    private authService: AuthService,
    public route: ActivatedRoute, 
    private exercisesService: ExercisesService,
    private unitsService: UnitsService,
  ) { 
    this.paramChangedSubscription = route.paramMap.subscribe(val => 
      {
        this.loadParameterDependentData(val.get('username'), val.get('page'));
      });
  }

  ngOnInit() {
    this.loadExercises();
    this.loadUnits();
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
      this.workoutsService.getWorkouts(username, pageParameter, this.pageSize)
        .subscribe(paginated => {
          this.paginatedWorkouts = paginated;
          this.workouts = paginated.results;
          this.currentPage = Number(pageParameter);

          // todo: scroll to top using a #id ?
        });
    }
  }

  deleteWorkout(workout): void {
    this.workoutsService.deleteWorkout(workout).subscribe(_ => this.getWorkouts(this.username, this.page));
  }

  loadExercises() {
    this.exercisesService.getExercises().subscribe(exercises => this.exercises = exercises);
  }

  loadUnits() {
    this.unitsService.getUnits().subscribe(units => {
      this.units = units.filter(u => u.measurement_type == MeasurementType.Weight);
    });
  }
}
