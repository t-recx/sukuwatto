import { Component, OnInit, Input } from '@angular/core';
import { PlanSession } from '../plan-session';
import { PlanSessionExercise } from '../plan-session-exercise';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-plan-session',
  templateUrl: './plan-session.component.html',
  styleUrls: ['./plan-session.component.css']
})
export class PlanSessionComponent implements OnInit {
  @Input() planSession: PlanSession;
  @Input() exercises: Exercise[];
  @Input() triedToSave: boolean;

  faTimesCircle = faTimesCircle;

  constructor() { }

  ngOnInit() {
  }

  newExercise() {
    let newExercise = new PlanSessionExercise();

    this.planSession.exercises.push(newExercise);
  }

  removeExercise(exercise) {
    const index = this.planSession.exercises.indexOf(exercise, 0);
    if (index > -1) {
      this.planSession.exercises.splice(index, 1);
    }
  }
}
