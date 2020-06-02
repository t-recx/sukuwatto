import { Component, OnInit, Input } from '@angular/core';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-exercise-card-description',
  templateUrl: './exercise-card-description.component.html',
  styleUrls: ['./exercise-card-description.component.css']
})
export class ExerciseCardDescriptionComponent implements OnInit {
  @Input() exercise: Exercise;

  constructor() { }

  ngOnInit(): void {
  }

}
