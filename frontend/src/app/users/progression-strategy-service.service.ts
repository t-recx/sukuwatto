import { Injectable } from '@angular/core';
import { Exercise } from './exercise';
import { ProgressionStrategy, ProgressionType } from './plan-progression-strategy';

@Injectable({
  providedIn: 'root'
})
export class ProgressionStrategyService {

  constructor() { }

  applies(progressionStrategy: ProgressionStrategy, exercise: Exercise, unit: number): boolean {
    if (progressionStrategy.parameter_increase && progressionStrategy.unit != unit) {
      return false;
    }

    if (progressionStrategy.progression_type == ProgressionType.ByExercise) {
      return progressionStrategy.exercise.id == exercise.id;
    }

    return (progressionStrategy.force == null || exercise.force == progressionStrategy.force) &&
      (progressionStrategy.mechanics == null || exercise.mechanics == progressionStrategy.mechanics) &&
      (progressionStrategy.section == null || exercise.section == progressionStrategy.section) &&
      (progressionStrategy.modality == null || exercise.modality == progressionStrategy.modality);
  }

  matches(a: ProgressionStrategy, b: ProgressionStrategy): boolean {
    return a.progression_type == b.progression_type &&
      (a.exercise && b.exercise && a.exercise.id == b.exercise.id) ||
      (
        a.section == b.section &&
        a.modality == b.modality &&
        a.force == b.force &&
        a.mechanics == b.mechanics
      );
  }
}
