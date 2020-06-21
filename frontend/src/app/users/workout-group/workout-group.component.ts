import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { WorkoutGroup } from '../workout-group';
import { faTimesCircle, faExchangeAlt, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import { ActivityType } from '../plan-session-group-activity';
import { WorkoutSet } from '../workout-set';
import { Workout } from '../workout';
import { Observable, Subscription } from 'rxjs';
import { ExerciseType } from '../exercise';

@Component({
  selector: 'app-workout-group',
  templateUrl: './workout-group.component.html',
  styleUrls: ['./workout-group.component.css']
})
export class WorkoutGroupComponent implements OnInit, OnDestroy {
  @Input() workout: Workout;
  @Input() group: WorkoutGroup;
  @Input() triedToSave: boolean;
  @Output() activityStatusChanged = new EventEmitter();
  @Input() workoutActivityStatusChanged: Observable<void>;
  @Output() alternateGroupRequested = new EventEmitter();
  @Input() hasAlternativeGroups: boolean = false;

  private workoutActivityStatusChangedSubscription: Subscription;

  faTimesCircle = faTimesCircle;
  faExchangeAlt = faExchangeAlt;
  faDumbbell = faDumbbell;

  activityType = ActivityType;

  selectedActivityType = ActivityType.Exercise;
  exerciseType = ExerciseType;

  constructor(
  ) { }

  ngOnInit() {
    this.selectCurrentActivityType(true);
    this.workoutActivityStatusChangedSubscription = this.workoutActivityStatusChanged
      .subscribe(() => 
        this.selectCurrentActivityType(false));
  }

  ngOnDestroy(): void {
    this.workoutActivityStatusChangedSubscription.unsubscribe();
  }

  selectCurrentActivityType(init: boolean): void {
    let numberWarmUpsNotDone = 0; 
    let numberExercisesDone = 0; 
    let lastWarmUpDone = false;
    let activityInProgressInGroup = false;

    if (this.group.warmups) {
      numberWarmUpsNotDone = this.group.warmups.filter(w => !w.done).length;
      if (this.group.warmups.length > 0) {
        lastWarmUpDone = this.group.warmups[this.group.warmups.length - 1].done;
      }

      if (!activityInProgressInGroup) {
        activityInProgressInGroup = this.group.warmups.filter(a => a.in_progress).length > 0;
      }
    }

    if (this.group.sets) {
      numberExercisesDone = this.group.sets.filter(w => w.done).length;

      if (!activityInProgressInGroup) {
        activityInProgressInGroup = this.group.sets.filter(a => a.in_progress).length > 0;
      }
    }

    if (init || activityInProgressInGroup) {
      if (!lastWarmUpDone && numberWarmUpsNotDone > 0 && numberExercisesDone == 0) {
        this.selectActivityType(ActivityType.WarmUp);
      }
      else {
        this.selectActivityType(ActivityType.Exercise);
      }
    }
  } 

  selectActivityType(type: ActivityType): void {
    this.selectedActivityType = type;
  }

  newSet(): void {
    let newSet = this.getNewSet(this.group.sets);

    this.group.sets.push(newSet);
  }

  newWarmUp(): void {
    let newSet = this.getNewSet(this.group.warmups);

    this.group.warmups.push(newSet);
  }

  getNewSet(sets: WorkoutSet[]): WorkoutSet {
    let newSet = new WorkoutSet();
    let order: number = 1;

    if (sets && sets.length > 0) {
      order = Math.max(...sets.map(x => x.order));
      order += 1;
    }

    newSet.order = order;

    return newSet;
  }

  setStatusChanged() {
    this.activityStatusChanged.emit();
  }

  exchange() {
    this.alternateGroupRequested.emit();
  }

  remove(): void {
    const index = this.workout.groups.indexOf(this.group, 0);
    if (index > -1) {
      this.workout.groups.splice(index, 1);
    }
  }
}
