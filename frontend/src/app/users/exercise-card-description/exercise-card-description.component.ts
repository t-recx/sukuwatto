import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Exercise } from '../exercise';
import { Muscle } from '../muscle';
import { MuscleRole } from '../muscle-exercise';

@Component({
  selector: 'app-exercise-card-description',
  templateUrl: './exercise-card-description.component.html',
  styleUrls: ['./exercise-card-description.component.css']
})
export class ExerciseCardDescriptionComponent implements OnInit,OnChanges {
  @Input() exercise: Exercise;

  agonistMuscles: Muscle[];
  antagonistMuscles: Muscle[];
  synergistMuscles: Muscle[];
  fixatorMuscles: Muscle[];
  targetMuscles: Muscle[];
  dynamicStabilizerMuscles: Muscle[];
  antagonistStabilizerMuscles: Muscle[];

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.exercise) {
      this.agonistMuscles = this.exercise.muscles.filter(x => x.role == MuscleRole.Agonist).map(x => x.muscle);
      this.antagonistMuscles = this.exercise.muscles.filter(x => x.role == MuscleRole.Antagonist).map(x => x.muscle);
      this.synergistMuscles = this.exercise.muscles.filter(x => x.role == MuscleRole.Synergist).map(x => x.muscle);
      this.fixatorMuscles = this.exercise.muscles.filter(x => x.role == MuscleRole.Fixator).map(x => x.muscle);
      this.dynamicStabilizerMuscles = this.exercise.muscles.filter(x => x.role == MuscleRole.DynamicStabilizer).map(x => x.muscle);
      this.antagonistStabilizerMuscles = this.exercise.muscles.filter(x => x.role == MuscleRole.AntagonistStabilizer).map(x => x.muscle);
      this.targetMuscles = this.exercise.muscles.filter(x => x.role == MuscleRole.Target).map(x => x.muscle);
    }
    else {
      this.agonistMuscles = null;
      this.antagonistMuscles = null;
      this.synergistMuscles = null;
      this.fixatorMuscles = null;
      this.targetMuscles = null;
      this.dynamicStabilizerMuscles = null;
      this.antagonistStabilizerMuscles = null;
    }
  }

  ngOnInit(): void {
  }

}
