import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivityType } from '../plan-session-group-activity';
import { WorkoutSet } from '../workout-set';
import { faDumbbell, faMapMarkedAlt, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import { ExerciseType } from '../exercise';

@Component({
  selector: 'app-workout-group-tab-content',
  templateUrl: './workout-group-tab-content.component.html',
  styleUrls: ['./workout-group-tab-content.component.css']
})
export class WorkoutGroupTabContentComponent implements OnInit {
  @Input() selectedActivityType: ActivityType;
  @Input() activityType: ActivityType;
  @Input() activities: WorkoutSet[];
  @Input() triedToSave: boolean;
  @Output() newActivity = new EventEmitter();
  @Output() statusChanged = new EventEmitter();

  ActivityType = ActivityType;
  exerciseType = ExerciseType;
  faDumbbell = faDumbbell;

  faMapMarkedAlt = faMapMarkedAlt;
  faStopwatch = faStopwatch;

  constructor() { }

  ngOnInit(): void {
  }

  new() {
    this.newActivity.emit();
  }

  track(activity: WorkoutSet): void {
    activity.tracking = true;
  }

  time(activity: WorkoutSet): void {
    // todo: show timer here
  }

  setStatusChanged() {
    this.statusChanged.emit();
  }
}
