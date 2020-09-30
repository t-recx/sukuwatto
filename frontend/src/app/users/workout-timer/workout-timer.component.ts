import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, timer, Observable, Subject } from 'rxjs';
import { Workout } from '../workout';
import { WorkoutSet } from '../workout-set';
import { map, takeUntil, repeatWhen } from 'rxjs/operators';
import { WorkoutGroup } from '../workout-group';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-workout-timer',
  templateUrl: './workout-timer.component.html',
  styleUrls: ['./workout-timer.component.css']
})
export class WorkoutTimerComponent implements OnInit, OnDestroy {
  @Input() workout: Workout;
  @Input() workoutActivityStatusChanged: Observable<void>;

  _start = new Subject<void>();
  _stop = new Subject<void>();

  activityInProgress: WorkoutSet;
  visible: boolean = false;
  timerActive: boolean = false;
  enabled: boolean = true;

  currentTimerDate: Date;
  private secondsTimer: Observable<any>;
  private workoutActivityStatusChangedSubscription: Subscription;
  private timerSubscription: Subscription;

  faTimes = faTimes;

  constructor() { }

  ngOnInit() {
    this.currentTimerDate = new Date(null);
    this.secondsTimer = timer(1000, 1000)
      .pipe(
        map(() => {}),
        takeUntil(this._stop),
        repeatWhen(() => this._start)
      );

    this.timerSubscription = this.secondsTimer.subscribe(() => this.tick());
    this.workoutActivityStatusChangedSubscription = this.workoutActivityStatusChanged
      .subscribe(() => 
        this.activityStatusChanged());
  }

  ngOnDestroy() {
    this.workoutActivityStatusChangedSubscription.unsubscribe();
    this.timerSubscription.unsubscribe();
  }

  getGroup(activity: WorkoutSet): WorkoutGroup {
    for (let group of this.workout.groups) {
      if (group.warmups.filter(x => x == activity).length > 0) {
        return group;
      }
      if (group.sets.filter(x => x == activity).length > 0) {
        return group;
      }
    }
    return null;
  }

  activityStatusChanged() {
    if (!this.enabled) {
      return;
    }

    let activities: WorkoutSet[] = [];

    for (let group of this.workout.groups) {
      activities.push(...group.warmups);
      activities.push(...group.sets);
    }

    let previousActivityGroup = this.getGroup(this.activityInProgress);
    let newActivityInProgress = activities.filter(a => a.in_progress)[0];
    let newActivityGroup = this.getGroup(newActivityInProgress);

    this.activityInProgress = newActivityInProgress;

    if (this.activityInProgress) {
      this.resetTimer();

      if (previousActivityGroup && previousActivityGroup != newActivityGroup) {
        this.stopTimer();
      }

      this.visible = true;
    }
    else {
      this.visible = false;
    }
  }

  tick(): void {
    this.currentTimerDate.setSeconds(this.currentTimerDate.getSeconds() + 1);
    this.currentTimerDate = new Date(this.currentTimerDate);
  }

  startTimer(): void {
    this._start.next();
    this.timerActive = true;
  }

  stopTimer(): void {
    this._stop.next();
    this.timerActive = false;
  }

  resetTimer(): void {
    this.stopTimer();
    this.currentTimerDate = new Date(null);
    this.startTimer();
  }

  toggleTimer(): void {
    if (this.timerActive) {
      this.stopTimer();
    }
    else {
      this.startTimer();
    }
  }

  disableTimer() {
    this.stopTimer();
    this.visible = false;
    this.enabled = false;
  }
}
