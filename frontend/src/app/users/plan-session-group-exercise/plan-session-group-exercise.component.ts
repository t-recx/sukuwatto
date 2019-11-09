import { Component, OnInit, Input } from '@angular/core';
import { PlanSessionGroupExercise } from '../plan-session-group-exercise';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-plan-session-group-exercise',
  templateUrl: './plan-session-group-exercise.component.html',
  styleUrls: ['./plan-session-group-exercise.component.css']
})
export class PlanSessionGroupExerciseComponent implements OnInit {
  @Input() planSessionGroupExercise: PlanSessionGroupExercise;
  @Input() exercises: Exercise[];
  @Input() triedToSave: boolean;

  constructor() { }

  ngOnInit() {
  }

}
