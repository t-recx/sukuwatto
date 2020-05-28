import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Workout } from '../workout';
import { UserProgressService } from '../user-progress.service';
import { AuthService } from 'src/app/auth.service';
import { UserProgressChartData, UserProgressChartSeries, UserProgressChartDataPoint } from '../user-progress-chart-data';

@Component({
  selector: 'app-workout-finish-workout-modal',
  templateUrl: './workout-finish-workout-modal.component.html',
  styleUrls: ['./workout-finish-workout-modal.component.css']
})
export class WorkoutFinishWorkoutModalComponent implements OnInit, OnChanges {
  @Input() workout: Workout;
  @Input() visible: boolean;
  @Input() triedToSave: boolean;
  @Output() closed = new EventEmitter();
  @Output() finished = new EventEmitter();

  progressData: UserProgressChartData = null;
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private userProgressService: UserProgressService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.visible) {
      if (this.visible) {
        this.loadChartData();
      }
    }
  }

  ngOnInit(): void {
  }

  loadChartData() {
    this.loading = true;

    if (this.authService.isLoggedIn()) {
      this.userProgressService
      .getFinishWorkoutProgress(this.authService.getUsername(), this.workout)
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

  hideFinishWorkout(): void {
    this.closed.emit();
  }

  finishWorkout(): void {
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
    }
  }

  setWorkoutEndTime(event: any) {
      if (event && this.workout) {
          let date: Date = new Date();

          if (this.workout.end) {
              date = new Date(this.workout.end);
          }

          this.workout.end = this.getDate(date, event);
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
