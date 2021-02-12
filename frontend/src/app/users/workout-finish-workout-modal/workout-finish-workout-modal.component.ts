import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Workout } from '../workout';
import { UserProgressService } from '../user-progress.service';
import { AuthService } from 'src/app/auth.service';
import { UserProgressChartData, UserProgressChartSeries, UserProgressChartDataPoint } from '../user-progress-chart-data';
import { faTimes, faCheck, faCircleNotch, faEye } from '@fortawesome/free-solid-svg-icons';
import { ExerciseType } from '../exercise';
import { VisibilityLabel } from 'src/app/visibility';
import { WorkoutGeneratorService } from '../workout-generator.service';
import { PlanSession } from '../plan-session';
import { LevelService } from '../level.service';
import { LevelUpObject } from './level-up-object';
import { v4 as uuid } from 'uuid';

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
  experienceBarWidth: number = 0;

  experienceBarIncreasing: boolean;

  transitionMs: number = 0;

  endDateEditVisible: boolean = false;

  currentLevel: number;

  deltaExperience: number;

  levelUpObjects: LevelUpObject[] = [];

  toggleEndDateEdit() {
    this.endDateEditVisible = !this.endDateEditVisible;
  }

  constructor(
    private authService: AuthService,
    private userProgressService: UserProgressService,
    private workoutGeneratorService: WorkoutGeneratorService,
    private levelService: LevelService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.visible) {
      if (this.visible) {
        this.finishing = false;
        this.loadChartData();
        this.currentLevel = +this.authService.getUserLevel();
        this.deltaExperience = this.levelService.getExperienceWorkout(this.workout) - (this.workout.experience ?? 0);
        this.setExperience(this.deltaExperience, this.currentLevel, +this.authService.getUserExperience());
      }
    }
  }

  levelUp() {
    this.level(true);
  }

  levelDown() {
    this.level(false);
  }

  level(up: boolean) {
    const levelUpObject = new LevelUpObject();
    levelUpObject.id = uuid();

    this.levelUpObjects.push(levelUpObject);

    if (up) {
      levelUpObject.text = "Level Up!";
      levelUpObject.color = "#fbc850";
    }
    else {
      levelUpObject.text = "Level Down!";
      levelUpObject.color = "#ee675d";
    }

    setTimeout(() => {
      levelUpObject.MarginBottom = 110;
      levelUpObject.Opacity = 0;
    });
  }

  ngOnInit(): void {
  }

  clearLevelUpObjects() {
     this.levelUpObjects = [];
  }

  setExperience(deltaExperience: number, userLevel: number, current: number): void {
      this.currentLevel = userLevel;
      const min = this.levelService.getLevelExperience(userLevel);
      const max = this.levelService.getLevelExperience(userLevel + 1);
      let updated = current + deltaExperience;
      let callAgain = false;
      let incLevel = 0;

      this.experienceBarIncreasing = deltaExperience >= 0;

      if (updated > max) {
        deltaExperience = deltaExperience - (max - current);
        updated = max;
        callAgain = true;
        incLevel = 1;
      }

      if (updated < min) {
        updated = min;
        deltaExperience = deltaExperience - (min - current);
        callAgain = true;
        incLevel = -1;
      }

      setTimeout(() => {
        this.transitionMs = 0;
        this.experienceBarWidth = ((current - min) / (max - min)) * 100;
      });

      setTimeout(() => {
        this.transitionMs = 300;
        this.experienceBarWidth = ((updated - min) / (max - min)) * 100;

        if (callAgain) {
          setTimeout(() => {
            current = updated;

            if (incLevel == 1) {
              this.levelUp();
            } else if (incLevel == -1) {
              this.levelDown();
            }

            this.setExperience(deltaExperience, userLevel + incLevel, current);
          }, 450);
        }
        else {
          setTimeout(() => this.clearLevelUpObjects(), 850);
        }
      }, 100);
  }

  loadChartData() {
    if (!this.showStrengthProgressCharts()) {
      this.progressData = null;
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
    this.transitionMs = 0;
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

