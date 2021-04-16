import { Injectable } from '@angular/core';
import { ExerciseType, Modality } from './exercise';
import { UnitsService } from './units.service';
import { Workout } from './workout';
import { WorkoutSet } from './workout-set';

@Injectable({
  providedIn: 'root'
})
export class LevelService {

  constructor(private unitService: UnitsService) { }

  getLevelExperience(level: number): number {
    const exponent = 1.5;
    const baseExperience = 1000;

    if (level <= 1) {
      return baseExperience;
    }

    return Math.floor(baseExperience * (Math.pow(level, exponent)));
  }

  getExperienceStrength(reps: number, weightKg: number) {
    if (reps > 0 && weightKg > 0) {
      return Math.floor((reps * weightKg) / 5);
    }

    return 0;
  }

  getExperienceCardio(caloriesKcal: number) {
    if (caloriesKcal > 0) {
      return Math.floor(caloriesKcal * 2.5);
    }

    return 0;
  }

  getExperience(activity: WorkoutSet): number {
    if (!activity.done) {
      return 0;
    }

    if (activity.exercise.exercise_type == ExerciseType.Strength) {
      let weight = 0;

      if (activity.exercise.modality == Modality.Calisthenics) {
        weight = 70;
      }
      else if (!activity.weight || activity.weight <= 0) {
        return 0;
      }
      else {
        weight = activity.weight;
      }

      return this.getExperienceStrength(activity.number_of_repetitions, this.unitService.convert(weight, activity.weight_unit, 'kg'));
    }
    else {
      return this.getExperienceCardio(this.unitService.convert(activity.calories, activity.energy_unit, 'kcal'))
    }
  }

  getExperienceWorkout(workout: Workout): number {
    let experience = 0;

    if (workout.groups) {
      workout.groups.forEach(group => {
        if (group.sets) {
          group.sets.forEach(set => {
            experience += this.getExperience(set);
          });
        }
        if (group.warmups) {
          group.warmups.forEach(warmup => {
            experience += this.getExperience(warmup);
          });
        }
      });
    }

    return experience;
  }

  getExperienceBarWidth(s: any) {
    const min = this.getLevelExperience(s.level);
    const max = this.getLevelExperience(s.level + 1);
    const current = s.experience;

    return ((current - min) / (max - min)) * 100;
  }
}
