import { Component, OnInit, Input } from '@angular/core';
import { WorkoutGroup } from '../workout-group';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ActivityType } from '../plan-session-group-activity';
import { Exercise } from '../exercise';
import { WorkoutSet } from '../workout-set';
import { Workout } from '../workout';
import { Unit } from '../unit';

@Component({
  selector: 'app-workout-group',
  templateUrl: './workout-group.component.html',
  styleUrls: ['./workout-group.component.css']
})
export class WorkoutGroupComponent implements OnInit {
  @Input() workout: Workout;
  @Input() group: WorkoutGroup;
  @Input() triedToSave: boolean;
  @Input() exercises: Exercise[];
  @Input() units: Unit[];

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
    this.group.sets.push(new WorkoutSet());
  }

  newWarmUp(): void {
    this.group.warmups.push(new WorkoutSet());
  }

  remove(): void {
    const index = this.workout.groups.indexOf(this.group, 0);
    if (index > -1) {
      this.workout.groups.splice(index, 1);
    }
  }
}
