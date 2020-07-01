import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivityType } from '../plan-session-group-activity';
import { WorkoutSet } from '../workout-set';
import { faDumbbell, faStop } from '@fortawesome/free-solid-svg-icons';
import { ExerciseType } from '../exercise';
import { Workout } from '../workout';
import { UserBioData } from '../user-bio-data';

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
  @Input() workout: Workout;
  @Input() userBioData: UserBioData;

  ActivityType = ActivityType;
  exerciseType = ExerciseType;

  faDumbbell = faDumbbell;
  faStop = faStop;

  timing: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  new() {
    this.newActivity.emit();
  }

  setStatusChanged() {
    this.statusChanged.emit();
  }
}
