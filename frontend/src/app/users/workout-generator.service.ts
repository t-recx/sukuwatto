import { Injectable } from '@angular/core';
import { Workout } from './workout';
import { PlanSession } from './plan-session';
import { WorkoutsService } from './workouts.service';
import { WorkingWeight } from './working-weight';
import { AuthService } from '../auth.service';
import { Observable, concat } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { WorkoutGroup } from './workout-group';
import { WorkoutSet } from './workout-set';
import { PlanSessionGroupActivity } from './plan-session-group-activity';
import { PlansService } from './plans.service';
import { PlanSessionGroup } from './plan-session-group';
import { ProgressionStrategy } from './plan-progression-strategy';
import { Exercise } from './exercise';
import { Plan } from './plan';

@Injectable({
  providedIn: 'root'
})
export class WorkoutGeneratorService {

  constructor(
    private workoutsService: WorkoutsService,
    private authService: AuthService,
  ) { }

  generate(start: Date, exercises: Exercise[], workingWeights: WorkingWeight[], plan: Plan, planSession: PlanSession): Observable<Workout> {
    return this.workoutsService.getLastWorkout(this.authService.getUsername(), plan.id, planSession.id, null).pipe(
      concatMap(lastWorkoutForPlanSession =>
        new Observable<Workout>(x => {
          console.log('generating workout...');
          let workout = new Workout();

          workout.start = start;
          workout.plan = plan.id;
          workout.plan_session = planSession.id;
          workout.name = this.getWorkoutName(workout.start, planSession);
          workout.working_weights = workingWeights;
          this.fillOutWorkingWeights(workingWeights, planSession);

          if (planSession.groups) {

            let sessionOrders = Array.from(new Set(planSession.groups.map(x => x.order))).sort((a, b) => a - b);
            for (let sessionOrder of sessionOrders) {
              var groups = planSession.groups.filter(x => x.order == sessionOrder);
              let planSessionGroup: PlanSessionGroup;
              let lastWorkoutGroup: WorkoutGroup = null;
              if (groups.length == 1 || lastWorkoutForPlanSession.id == null) {
                planSessionGroup = groups[0];
              } 
              else {
                planSessionGroup = groups[0];
                lastWorkoutGroup = lastWorkoutForPlanSession.groups.filter(x => x.order == sessionOrder)[0];

                if (lastWorkoutGroup) {
                  let nextSessionGroup = groups.filter(x => x.id > lastWorkoutGroup.plan_session_group)[0];
                  if (nextSessionGroup) {
                    planSessionGroup = nextSessionGroup;
                  }
                }
              }
              let workoutGroup = new WorkoutGroup();

              workoutGroup.name = planSessionGroup.name;
              workoutGroup.order = planSessionGroup.order;
              workoutGroup.plan_session_group = planSessionGroup.id;

              workoutGroup.warmups = this.getSets(exercises, workingWeights, plan, planSession, planSessionGroup, planSessionGroup.warmups, lastWorkoutGroup ? lastWorkoutGroup.warmups : []);
              workoutGroup.sets = this.getSets(exercises, workingWeights, plan, planSession, planSessionGroup, planSessionGroup.exercises, lastWorkoutGroup ? lastWorkoutGroup.sets : []);

              workout.groups.push(workoutGroup);
            }
          }

          console.log('finished generating workout...');
          x.next(workout);
          x.complete();
        })));
  }

  getWorkoutName(start: Date, planSession: PlanSession): string {
    let name: string = "";

    if (start) {
      name += start.toLocaleDateString('en-us', { weekday: 'long' }) + "'s";
    }

    if (planSession) {
      name += " " + planSession.name;
    }

    name += " session";

    return name;
  }

  updateWeights(workout: Workout, workingWeights: WorkingWeight[]): void {
          console.log('updating workout weights...');
    if (workout.groups) {
      for (let group of workout.groups) {
        let sets: WorkoutSet[] = []; 

        if (group.warmups) {
          sets.push(...group.warmups);
        }

        if (group.sets) {
          sets.push(...group.sets);
        }

        for (let set of sets) {
          let workingWeight = this.getWorkingWeight(workingWeights, set.exercise, 
            set.working_weight_percentage);
          if (workingWeight) {
            set.weight = workingWeight.weight;
            set.unit = workingWeight.unit;
          }
        }
      }
    }

          console.log('finished updating workout weights...');
  }

  fillOutWorkingWeights(workingWeights: WorkingWeight[], planSession: PlanSession): void {
    let exercises: number[] = [];
    let unit: number = null;

    if (workingWeights.length > 0) {
      unit = workingWeights[0].unit;
    }

    for (let group of planSession.groups) {
      for (let warmup of group.warmups) {
        exercises.push(warmup.exercise);
      }

      for (let set of group.exercises) {
        exercises.push(set.exercise);
      }
    }

    for (let exercise of new Set(exercises)) {
      if (workingWeights.filter(x => x.exercise == exercise).length == 0) {
        let workingWeight = new WorkingWeight();

        workingWeight.exercise = exercise;

        if (unit) {
          workingWeight.unit = unit;
        }
        console.log(workingWeight);
        workingWeights.push(workingWeight);
      }
    }
  }

  private applyProgressionStrategy(
    exercise_id: number,
    exercises: Exercise[],
    workingWeights: WorkingWeight[],
    progressionStrategy: ProgressionStrategy): boolean {
    let workingWeight: WorkingWeight;
    let exerciseModel = exercises.filter(x => x.id == exercise_id);
    workingWeight = workingWeights.filter(ww => ww.exercise == exercise_id)[0];

    console.log('evaluating progression strategy:');
    console.log(progressionStrategy);
    if (workingWeight) {
      if (progressionStrategy.exercise) {
        if (progressionStrategy.exercise == exercise_id) {
          console.log('Applying progression strategy because exercise matches');
          this.updateWorkingWeight(workingWeight, progressionStrategy);
        }
      }
      else {
        if (exerciseModel && exerciseModel.length > 0) {
          if (exerciseModel.filter(x =>
            (progressionStrategy.force == null || x.force == progressionStrategy.force) &&
            (progressionStrategy.mechanics == null || x.mechanics == progressionStrategy.mechanics) &&
            (progressionStrategy.section == null || x.section == progressionStrategy.section) &&
            (progressionStrategy.modality == null || x.modality == progressionStrategy.modality)).length > 0) {
          console.log('Applying progression strategy by characteristic of the exercise');
          console.log('before:');
          console.log(workingWeight);
            this.updateWorkingWeight(workingWeight, progressionStrategy);
          console.log('after:');
          console.log(workingWeight);
          }
        }
      }
    }
    console.log('ending evaluating progression strategy');

    return false;
  }

  private updateWorkingWeight(workingWeight: WorkingWeight, progressionStrategy: ProgressionStrategy) {
    workingWeight.previous_weight = workingWeight.weight;
    workingWeight.previous_unit = workingWeight.unit;
    if (workingWeight.weight) {
      if (progressionStrategy.weight_increase && progressionStrategy.unit == workingWeight.unit) {
        workingWeight.weight += progressionStrategy.weight_increase;
      }
      else if (progressionStrategy.percentage_increase) {
        workingWeight.weight = this.getIncreasedWeightWithPercentage(workingWeight.previous_weight, workingWeight.previous_unit, progressionStrategy.percentage_increase);
      }
    }
  }

  private getSets(
    exercises: Exercise[],
    workingWeights: WorkingWeight[], 
    plan: Plan,
    planSession: PlanSession,
    planSessionGroup: PlanSessionGroup,
    planActivities: PlanSessionGroupActivity[], 
    lastWorkoutActivities: WorkoutSet[]): WorkoutSet[] {
    let sets: WorkoutSet[] = [];
    let orders = Array.from(new Set(planActivities.map(x => x.order))).sort((a, b) => a - b);
    for (let order of orders) {
      var warmups = planActivities.filter(x => x.order == order);
      let lastWorkoutSessionWarmUp: WorkoutSet = null;

      if (warmups) {
        let sessionWarmUp: PlanSessionGroupActivity;

        if (warmups.length == 1 || lastWorkoutActivities == null || lastWorkoutActivities.length == 0) {
          sessionWarmUp = warmups[0];
        }
        else {
          sessionWarmUp = warmups[0];
          lastWorkoutSessionWarmUp = lastWorkoutActivities.filter(x => x.order == order)[0];

          if (lastWorkoutSessionWarmUp) {
            let nextWorkoutSessionWarmUp = warmups.filter(x => x.id > lastWorkoutSessionWarmUp.plan_session_group_activity)[0];
            if (nextWorkoutSessionWarmUp) {
              sessionWarmUp = nextWorkoutSessionWarmUp;
            }
          }
        }

        if (!this.progressionStrategyAppliedToExercise(sessionWarmUp.exercise, workingWeights)) {
          let progressionStrategies: ProgressionStrategy[] = [];

          if (planSessionGroup.progressions) {
            progressionStrategies.push(...planSessionGroup.progressions);
          }
          if (planSession.progressions) {
            progressionStrategies.push(...planSession.progressions);
          }
          if (plan.progressions) {
            progressionStrategies.push(...plan.progressions);
          }
console.log('progression strategies available:');
console.log(progressionStrategies);
          for (let progressionStrategy of progressionStrategies) {
            if (this.applyProgressionStrategy(sessionWarmUp.exercise, exercises, 
              workingWeights, progressionStrategy)) {
              break;
            }
          }
        }

        for (var i = 0; i < sessionWarmUp.number_of_sets; i++) {
          sets.push(this.getSet(workingWeights, sessionWarmUp));
        }
      }
    }

    return sets;
  }

  private progressionStrategyAppliedToExercise(exercise_id: number, workingWeights: WorkingWeight[]) {
    return workingWeights.filter(ww => ww.exercise == exercise_id && ww.previous_weight != null && 
      ww.previous_weight != ww.weight).length > 0;
  }

  private getSet(workingWeights: WorkingWeight[], sessionActivity: PlanSessionGroupActivity): WorkoutSet {
    let workingWeight = this.getWorkingWeight(workingWeights, sessionActivity.exercise, sessionActivity.working_weight_percentage);
    let set = new WorkoutSet();
    set.working_weight_percentage = sessionActivity.working_weight_percentage;
    set.order = sessionActivity.order;
    set.exercise = sessionActivity.exercise;
    set.expected_number_of_repetitions = sessionActivity.number_of_repetitions;
    set.expected_number_of_repetitions_up_to = sessionActivity.number_of_repetitions_up_to;
    set.repetition_type = sessionActivity.repetition_type;
    set.plan_session_group_activity = sessionActivity.id;
    if (workingWeight && workingWeight.weight) {
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
      workingWeight.weight = this.getIncreasedWeightWithPercentage(
        filteredWorkingWeight.weight,
        filteredWorkingWeight.unit,
        percentage);
    }

    return workingWeight;
  }

  getIncreasedWeightWithPercentage(weight: number, unit: number, percentage: number): number {
    // todo: round up the weight generated below to normal regular plates' weights accordingly to 
    // unit system type:
    if (percentage) {
      return weight * (percentage / 100);
    }

    // if we don't have a percentage... this could mean we're just using the bar
    return null;
  }
}
