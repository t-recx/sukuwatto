import { Component, OnInit, Input } from '@angular/core';
import { PlanSessionExercise } from '../plan-session-exercise';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-plan-session-exercise',
  templateUrl: './plan-session-exercise.component.html',
  styleUrls: ['./plan-session-exercise.component.css']
})
export class PlanSessionExerciseComponent implements OnInit {
  @Input() planSessionExercise: PlanSessionExercise;
  @Input() exercises: Exercise[];
  @Input() triedToSave: boolean;

  constructor() { }

  ngOnInit() {
  }

}
