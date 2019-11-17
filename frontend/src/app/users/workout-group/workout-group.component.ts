import { Component, OnInit, Input } from '@angular/core';
import { WorkoutGroup } from '../workout-group';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ActivityType } from '../plan-session-group-activity';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-workout-group',
  templateUrl: './workout-group.component.html',
  styleUrls: ['./workout-group.component.css']
})
export class WorkoutGroupComponent implements OnInit {
  @Input() group: WorkoutGroup;
  @Input() triedToSave: boolean;
  @Input() exercises: Exercise[];

  faTimesCircle = faTimesCircle;

  activityType = ActivityType;

  selectedActivityType = ActivityType.Exercise;

  constructor() { }

  ngOnInit() {
  }

  selectActivityType(type: ActivityType): void {
    this.selectedActivityType = type;
  }

  newSet(): void {

  }

  newWarmUp(): void {

  }
}
