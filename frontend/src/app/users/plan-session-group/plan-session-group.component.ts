import { Component, OnInit, Input } from '@angular/core';
import { PlanSessionGroup } from '../plan-session-group';
import { PlanSessionGroupExercise } from '../plan-session-group-exercise';
import { faTimesCircle, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import { PlanActivityTab } from '../plan-session-group-activity';
import { PlanSessionGroupWarmUp } from '../plan-session-group-warmup';

@Component({
  selector: 'app-plan-session-group',
  templateUrl: './plan-session-group.component.html',
  styleUrls: ['./plan-session-group.component.css']
})
export class PlanSessionGroupComponent implements OnInit {
  @Input() planSessionGroup: PlanSessionGroup;
  @Input() triedToSave: boolean;

  activityType = PlanActivityTab;

  selectedActivityType = PlanActivityTab.Exercise;
  faTimesCircle = faTimesCircle;
  faDumbbell = faDumbbell;

  constructor() { }

  ngOnInit() {
  }

  selectActivityType(type: PlanActivityTab): void {
    this.selectedActivityType = type;
  }

  newExercise() {
    let newExercise = new PlanSessionGroupExercise();

    newExercise.working_weight_percentage = 100;

    this.setOrder(newExercise, this.planSessionGroup.exercises);

    this.planSessionGroup.exercises.push(newExercise);
  }

  removeExercise(exercise) {
    const index = this.planSessionGroup.exercises.indexOf(exercise, 0);
    if (index > -1) {
      this.planSessionGroup.exercises.splice(index, 1);

      this.adjustRemainingOrders(exercise, this.planSessionGroup.exercises);
    }
  }

  newWarmUp() {
    let newWarmUp = new PlanSessionGroupWarmUp();

    this.setOrder(newWarmUp, this.planSessionGroup.warmups);

    this.planSessionGroup.warmups.push(newWarmUp);
  }

  removeWarmUp(warmup) {
    const index = this.planSessionGroup.warmups.indexOf(warmup, 0);
    if (index > -1) {
      this.planSessionGroup.warmups.splice(index, 1);

      this.adjustRemainingOrders(warmup, this.planSessionGroup.warmups);
    }
  }

  setOrder(item: any, items: any) {
    let orders = items.map(x => x.order).sort((a, b) => b - a);

    if (items.length > 0) {
      item.order = orders[0] + 1;
    }
    else {
      item.order = 1;
    }
  }

  adjustRemainingOrders(item: any, items: any) {
    items.filter(x => x.order > item.order).forEach(x => x.order--);
  }
}
