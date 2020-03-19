import { Component, OnInit, Input } from '@angular/core';
import { PlanSessionGroup } from '../plan-session-group';
import { PlanSessionGroupExercise } from '../plan-session-group-exercise';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ActivityType } from '../plan-session-group-activity';
import { PlanSessionGroupWarmUp } from '../plan-session-group-warmup';

@Component({
  selector: 'app-plan-session-group',
  templateUrl: './plan-session-group.component.html',
  styleUrls: ['./plan-session-group.component.css']
})
export class PlanSessionGroupComponent implements OnInit {
  @Input() planSessionGroup: PlanSessionGroup;
  @Input() triedToSave: boolean;

  activityType = ActivityType;

  selectedActivityType = ActivityType.Exercise;
  faTimesCircle = faTimesCircle;

  constructor() { }

  ngOnInit() {
  }

  selectActivityType(type: ActivityType): void {
    this.selectedActivityType = type;
  }

  newExercise() {
    let newExercise = new PlanSessionGroupExercise();

    newExercise.working_weight_percentage = 100;

    this.planSessionGroup.exercises.push(newExercise);
  }

  removeExercise(exercise) {
    const index = this.planSessionGroup.exercises.indexOf(exercise, 0);
    if (index > -1) {
      this.planSessionGroup.exercises.splice(index, 1);
    }
  }

  newWarmUp() {
    let newWarmUp = new PlanSessionGroupWarmUp();

    this.planSessionGroup.warmups.push(newWarmUp);
  }

  removeWarmUp(warmup) {
    const index = this.planSessionGroup.warmups.indexOf(warmup, 0);
    if (index > -1) {
      this.planSessionGroup.warmups.splice(index, 1);
    }
  }
}
