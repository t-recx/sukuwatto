import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Muscle } from '../muscle';
import { MuscleExercise, MuscleRoleLabel } from '../muscle-exercise';

@Component({
  selector: 'app-exercise-muscle',
  templateUrl: './exercise-muscle.component.html',
  styleUrls: ['./exercise-muscle.component.css']
})
export class ExerciseMuscleComponent implements OnInit, OnChanges {
  @Input() muscle: MuscleExercise;
  @Input() muscles: Muscle[];
  @Input() triedToSave: boolean;

  muscle_id: number;

  roleTypeLabel = MuscleRoleLabel;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.muscle.muscle) {
      this.muscle_id = this.muscle.muscle.id;
    }
    else {
      this.muscle_id = null;
    }
  }

  ngOnInit(): void {
  }

  muscleChanged(id:any) {
    if (id == 0) {
      this.muscle.muscle = null;
    }
    else {
      this.muscle.muscle = this.muscles.filter(m => m.id == id)[0];
      console.log(this.muscle);
    }
  }

}
