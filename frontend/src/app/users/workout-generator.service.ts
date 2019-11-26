import { Injectable } from '@angular/core';
import { Workout } from './workout';
import { PlanSession } from './plan-session';
import { WorkoutsService } from './workouts.service';
import { WorkingWeightsService } from './working-weights.service';
import { WorkingWeight } from './working-weight';
import { AuthService } from '../auth.service';
import { Observable, concat } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { WorkoutGroup } from './workout-group';
import { WorkoutSet } from './workout-set';
import { PlanSessionGroupActivity } from './plan-session-group-activity';

@Injectable({
  providedIn: 'root'
})
export class WorkoutGeneratorService {

  constructor(
    private workoutsService: WorkoutsService,
    private workingWeightsService: WorkingWeightsService,
    private authService: AuthService,
  ) { }

  generate(workingWeights: WorkingWeight[], planSession: PlanSession): Observable<Workout> {
     return new Observable<Workout>(x => { 
      let workout = new Workout();

      this.updateWorkingWeights(workingWeights, planSession);

      if (planSession.groups) {
        for (let planSessionGroup of planSession.groups.sort((a,b) => a.order - b.order)) {
          let workoutGroup = new WorkoutGroup();

          workoutGroup.name = planSessionGroup.name;
          workoutGroup.order = planSessionGroup.order;

          for (let sessionWarmUp of planSessionGroup.warmups.sort((a,b) => a.order - b.order)) {
            for (var i=0; i < sessionWarmUp.number_of_sets; i++) {
              workoutGroup.warmups.push(this.getSet(workingWeights, sessionWarmUp));
            }
          }

          for (let sessionSet of planSessionGroup.exercises.sort((a,b) => a.order - b.order)) {
            for (var i=0; i < sessionSet.number_of_sets; i++) {
              workoutGroup.sets.push(this.getSet(workingWeights, sessionSet));
            }
          }
        }
      }

      x.next(workout);
      x.complete();
    });
  }

  private getSet(workingWeights: WorkingWeight[], sessionActivity: PlanSessionGroupActivity): WorkoutSet {
    let workingWeight = this.getWorkingWeight(workingWeights, sessionActivity.exercise, sessionActivity.working_weight_percentage);
    let set = new WorkoutSet();
    set.order = sessionActivity.order;
    set.exercise = sessionActivity.exercise;
    set.expected_number_of_repetitions = sessionActivity.number_of_repetitions;
    set.expected_number_of_repetitions_up_to = sessionActivity.number_of_repetitions_up_to;
    set.repetition_type = sessionActivity.repetition_type;
    if (workingWeight) {
      set.weight = workingWeight.weight;
      set.unit = workingWeight.unit;
    }

    return set;
  }

  getWorkingWeight(workingWeights: WorkingWeight[], exercise: number, percentage: number): WorkingWeight {
    let workingWeight = new WorkingWeight();
    let filteredWorkingWeight = workingWeights.filter(x => x.exercise == exercise)[0];

    workingWeight.exercise = exercise;

    if (filteredWorkingWeight) {
      workingWeight.id = filteredWorkingWeight.id;
      workingWeight.unit = filteredWorkingWeight.unit;
      workingWeight.weight = filteredWorkingWeight.weight * (percentage / 100);
    }

    return workingWeight;
  }

  updateWorkingWeights(workingWeights: WorkingWeight[], planSession: PlanSession): void {

  }
}
