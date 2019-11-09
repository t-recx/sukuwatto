import { Component, OnInit, Input } from '@angular/core';
import { Exercise } from '../exercise';
import { PlanSessionGroup } from '../plan-session-group';
import { PlanSessionGroupExercise } from '../plan-session-group-exercise';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-plan-session-group',
  templateUrl: './plan-session-group.component.html',
  styleUrls: ['./plan-session-group.component.css']
})
export class PlanSessionGroupComponent implements OnInit {
  @Input() planSessionGroup: PlanSessionGroup;
  @Input() exercises: Exercise[];
  @Input() triedToSave: boolean;

  faTimesCircle = faTimesCircle;

  constructor() { }

  ngOnInit() {
  }

  newExercise() {
    let newExercise = new PlanSessionGroupExercise();

    this.planSessionGroup.exercises.push(newExercise);
  }

  removeExercise(exercise) {
    const index = this.planSessionGroup.exercises.indexOf(exercise, 0);
    if (index > -1) {
      this.planSessionGroup.exercises.splice(index, 1);
    }
  }
}
