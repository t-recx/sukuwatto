import { Component, OnInit, Input } from '@angular/core';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-exercise-detail-skeleton',
  templateUrl: './exercise-detail-skeleton.component.html',
  styleUrls: ['./exercise-detail-skeleton.component.css']
})
export class ExerciseDetailSkeletonComponent {
  @Input() exercise: Exercise;
  @Input() triedToSave: boolean;
  @Input() showTitle: boolean = true;

  constructor() { }
}
