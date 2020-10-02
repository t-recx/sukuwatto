import { Component, OnInit, Input } from '@angular/core';
import { faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Exercise } from '../exercise';
import { Muscle } from '../muscle';
import { MuscleExercise, MuscleRole, MuscleRoleLabel } from '../muscle-exercise';
import { MusclesService } from '../muscles.service';

@Component({
  selector: 'app-exercise-detail-skeleton',
  templateUrl: './exercise-detail-skeleton.component.html',
  styleUrls: ['./exercise-detail-skeleton.component.css']
})
export class ExerciseDetailSkeletonComponent {
  @Input() exercise: Exercise;
  @Input() triedToSave: boolean;
  @Input() showTitle: boolean = true;

  muscles: Muscle[];
  faTrash = faTrash;
  faPlus = faPlusCircle;

  constructor(
    private musclesService: MusclesService,
  ) {
    musclesService.getMuscles().subscribe(muscles => {
      this.muscles = muscles;
    });
   }

  removeMuscle(muscle) {
    const index = this.exercise.muscles.indexOf(muscle, 0);
    if (index > -1) {
      this.exercise.muscles.splice(index, 1);
    }
  }

  addMuscle() {
    if (!this.exercise.muscles) {
      this.exercise.muscles = [];
    }

    const me = new MuscleExercise();
    me.muscle = new Muscle();

    this.exercise.muscles.push(me);
  }
}
