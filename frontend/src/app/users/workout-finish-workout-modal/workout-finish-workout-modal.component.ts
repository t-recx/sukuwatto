import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Workout } from '../workout';
import { UserProgressService } from '../user-progress.service';
import { AuthService } from 'src/app/auth.service';
import { UserProgressChartData, UserProgressChartSeries, UserProgressChartDataPoint } from '../user-progress-chart-data';
import { faTimes, faCheck, faCircleNotch, faEye } from '@fortawesome/free-solid-svg-icons';
import { ExerciseType } from '../exercise';
import { VisibilityLabel } from 'src/app/visibility';
import { WorkoutGeneratorService } from '../workout-generator.service';
import { PlanSession } from '../plan-session';

@Component({
  selector: 'app-workout-finish-workout-modal',
  templateUrl: './workout-finish-workout-modal.component.html',
  styleUrls: ['./workout-finish-workout-modal.component.css']
})
export class WorkoutFinishWorkoutModalComponent implements OnInit, OnChanges {
  @Input() workout: Workout;
  @Input() visible: boolean;
  @Input() triedToSave: boolean;
  @Input() planSessions: PlanSession[];
  @Output() closed = new EventEmitter();
  @Output() finished = new EventEmitter();

  visibilityLabel = VisibilityLabel;

  progressData: UserProgressChartData = null;
  loading: boolean = false;
  finishing: boolean = false;

  faTimes = faTimes;
  faCheck = faCheck;
  faCircleNotch = faCircleNotch;
  faEye = faEye;

  endDateEditVisible: boolean = false;

  toggleEndDateEdit() {
    this.endDateEditVisible = !this.endDateEditVisible;
  }

  constructor(
    private authService: AuthService,
    private userProgressService: UserProgressService,
    private workoutGeneratorService: WorkoutGeneratorService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.visible) {
      if (this.visible) {
        this.finishing = false;
        this.loadChartData();
      }
    }
  }

  ngOnInit(): void {
  }

  loadChartData() {
    if (!this.showStrengthProgressCharts()) {
      return;
    }

    this.loading = true;

    if (this.authService.isLoggedIn()) {
      this.userProgressService
      .getFinishWorkoutStrengthProgress(this.authService.getUsername(), this.workout)
        .subscribe(pd => {
          if (pd.series && pd.series.length > 0) {
            let npd = new UserProgressChartData();

            npd.name = "Progress";
            npd.series = pd.series
              .map(x => new UserProgressChartSeries(x.exercise.short_name,
                x.dataPoints.map(y => new UserProgressChartDataPoint(x.exercise.short_name, y.weight, y.date))));

            if (npd.series && npd.series.length > 0) {
              npd.dates = [... new Set(npd.series.flatMap(x => x.dataPoints.map(y => y.date)))];

              this.progressData = npd;
            }
          }
          else {
            this.progressData = null;
          }

          this.loading = false;
        });
    }
  }
  showStrengthProgressCharts(): boolean {
    return this.workout.groups && 
      this.workout
      .groups.filter(g => 
        g.sets.filter(s => s.done && s.exercise && s.exercise.exercise_type == ExerciseType.Strength).length > 0)
        .length > 0;
  }

  hideFinishWorkout(): void {
    this.closed.emit();
  }

  finishWorkout(): void {
    //this.visible = false;
    this.finishing = true;
    this.finished.emit();
  }

  setWorkoutEndDate(event: any) {
    if (event && this.workout) {
      if (this.workout.end) {
        this.workout.end = new Date(event + " " + new Date(this.workout.end).toTimeString().substring(0, 5));
      }
      else {
        this.workout.end = new Date(event);
      }

      this.updateWorkoutStartDateIfBiggerThanEnd();
    }
  }

  setWorkoutEndTime(event: any) {
      if (event && this.workout) {
          let date: Date = new Date();

          if (this.workout.end) {
              date = new Date(this.workout.end);
          }

          this.workout.end = this.getDate(date, event);
          this.updateWorkoutStartDateIfBiggerThanEnd();
      }
  }

  updateWorkoutStartDateIfBiggerThanEnd() {
    if (this.workout.end && this.workout.start > this.workout.end) {
      this.workout.start = this.workout.end;

      let planSession: PlanSession = null;


      if (this.workout.plan_session && this.planSessions) {
        planSession = this.planSessions.filter(s => s.id == this.workout.plan_session)[0];
      }

      this.workout.name = this.workoutGeneratorService.getWorkoutName(this.workout.start, planSession);
    }
  }

  getDate(date: Date, timeString: string) : Date {
      let year = date.getFullYear();
      let month = date.getMonth();
      let day = date.getDate();
      let hour = +timeString.substr(0, 2);
      let minute = +timeString.substr(3, 2);

      return new Date(year, month, day, hour, minute);
  }
}
