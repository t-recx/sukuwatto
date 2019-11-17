import { Component, OnInit, Input } from '@angular/core';
import { WorkoutSet } from '../workout-set';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-workout-set',
  templateUrl: './workout-set.component.html',
  styleUrls: ['./workout-set.component.css']
})
export class WorkoutSetComponent implements OnInit {
  @Input() workoutActivity: WorkoutSet;
  @Input() triedToSave: boolean;
  @Input() exercises: Exercise[];

  constructor() { }

  ngOnInit() {
  }

}
