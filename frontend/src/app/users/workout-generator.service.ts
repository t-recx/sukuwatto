import { Injectable } from '@angular/core';
import { Workout } from './workout';
import { PlanSession } from './plan-session';
import { WorkoutsService } from './workouts.service';
import { WorkingWeight } from './working-weight';
import { AuthService } from '../auth.service';
import { Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { WorkoutGroup } from './workout-group';
import { WorkoutSet } from './workout-set';
import { PlanSessionGroupActivity } from './plan-session-group-activity';
import { PlanSessionGroup } from './plan-session-group';
import { ProgressionStrategy } from './plan-progression-strategy';
import { Exercise } from './exercise';
import { Plan } from './plan';
import { UnitsService } from './units.service';
import { Unit, MeasurementType } from './unit';
import { ProgressionStrategyService } from './progression-strategy-service.service';

@Injectable({
  providedIn: 'root'
})
export class WorkoutGeneratorService {

  units: Unit[];
  weightUnits: Unit[];

  constructor(
    private workoutsService: WorkoutsService,
    private authService: AuthService,
    private unitsService: UnitsService,
    private progressionStrategyService: ProgressionStrategyService,
  ) {
    unitsService.getUnits().subscribe(units => {
      this.units = units;
      this.weightUnits = this.units.filter(u => u.measurement_type == MeasurementType.Weight) 
    });
  }

  generate(start: Date, workingWeights: WorkingWeight[], plan: Plan, planSession: PlanSession): Observable<Workout> {
    return this.workoutsService.getLastWorkout(this.authService.getUsername(), plan.id, planSession.id, null).pipe(
      concatMap(lastWorkoutForPlanSession =>
        new Observable<Workout>(x => {
          let workout = new Workout(
            {
              start, 
              plan: plan.id, 
              plan_session: planSession.id,
              name: this.getWorkoutName(start, planSession),
            });

          workout.working_weights = this.getClonedWorkingWeights(workingWeights);
          if (workout.working_weights) {
            workout.working_weights.forEach(ww => {
                ww.previous_unit = ww.unit;
                ww.previous_unit_code = ww.unit_code;
                ww.previous_weight = ww.weight;
            });
          }

          this.fillOutWorkingWeights(workout.working_weights, planSession);

          if (planSession.groups) {
            let sessionOrders = Array.from(new Set(planSession.groups.map(x => x.order))).sort((a, b) => a - b);

            for (let sessionOrder of sessionOrders) {
              var groups = planSession.groups.filter(x => x.order == sessionOrder).sort((a,b) => a.id - b.id);
              let planSessionGroup: PlanSessionGroup;
              let lastWorkoutGroup: WorkoutGroup = null;

              if (lastWorkoutForPlanSession != null && 
                lastWorkoutForPlanSession.groups != null &&
                lastWorkoutForPlanSession.groups.length > 0) {
                lastWorkoutGroup = lastWorkoutForPlanSession.groups.filter(x => x.order == sessionOrder)[0];
              }

              let nextSessionGroup: PlanSessionGroup = null;

              if (lastWorkoutGroup) {
                nextSessionGroup = groups.filter(x => x.id > lastWorkoutGroup.plan_session_group)[0];
              }

              if (nextSessionGroup == null) {
                nextSessionGroup = groups[0];
              }

              planSessionGroup = nextSessionGroup;

              workout.groups.push(this.generateGroup(planSessionGroup, lastWorkoutGroup));
            }
          }

          workout.working_weights = this.getWorkingWeightsWithProgressions(workout.working_weights, workout, plan);

          this.updateWeights(workout, workout.working_weights);

          x.next(workout);
          x.complete();
        })));
  }

  alternateGroupOnWorkout(workout: Workout, plan: Plan, planSession: PlanSession, workoutGroup: WorkoutGroup) : Observable<Workout> {
    return this.workoutsService.getLastWorkoutGroup(this.authService.getUsername(), null, planSession.id).pipe(
      concatMap(lastWorkoutGroupForPlanSessionGroup =>
        new Observable<Workout>(x => {
          let nextSessionGroup: PlanSessionGroup = null;
          let planSessionGroupsWithSameOrder = planSession.groups.filter(x => x.order == workoutGroup.order).sort((a, b) => a.id - b.id);

          if (workoutGroup) {
            nextSessionGroup = planSessionGroupsWithSameOrder.filter(x => x.id > workoutGroup.plan_session_group)[0];
          }

          if (nextSessionGroup == null) {
            nextSessionGroup = planSessionGroupsWithSameOrder[0];
          }

          let planSessionGroup = nextSessionGroup;

          workout.groups = workout.groups.filter(x => x.plan_session_group != workoutGroup.plan_session_group);

          workout.groups.push(this.generateGroup(planSessionGroup, lastWorkoutGroupForPlanSessionGroup.order ? lastWorkoutGroupForPlanSessionGroup : null));

          workout.working_weights = this.getWorkingWeightsWithProgressions(workout.working_weights, workout, plan);

          this.updateWeights(workout, workout.working_weights);

          x.next(workout);
          x.complete();
        })));
  }

  generateGroup(planSessionGroup: PlanSessionGroup, lastWorkoutGroup: WorkoutGroup): WorkoutGroup {
    return new WorkoutGroup(
      {
        name: planSessionGroup.name,
        order: planSessionGroup.order,
        plan_session_group: planSessionGroup.id,
        warmups: this.getActivities(planSessionGroup.warmups, lastWorkoutGroup ? lastWorkoutGroup.warmups : []),
        sets: this.getActivities(planSessionGroup.exercises, lastWorkoutGroup ? lastWorkoutGroup.sets : []),
      });
  }

  getClonedWorkingWeights(workingWeights: WorkingWeight[]): WorkingWeight[] {
    return workingWeights.map(ww => new WorkingWeight(ww));
  }

  getWorkingWeightsWithProgressions(
    workingWeights: WorkingWeight[],
    workout: Workout,
    plan: Plan) : WorkingWeight[] {
    let newWorkingWeights = this.getClonedWorkingWeights(workingWeights);
    let userChangedWorkingWeights = newWorkingWeights.filter(x => x.manually_changed);
    let automaticWorkingWeights = newWorkingWeights.filter(x => !x.manually_changed);
    let planSession = plan.sessions.filter(p => p.id == workout.plan_session)[0];

    for (let group of workout.groups) {
      for (let set of group.sets) {
        let planSessionGroup = null;
        if (planSession) {
          planSessionGroup = planSession.groups.filter(p => p.id == group.plan_session_group)[0];
        }
        const exercise = set.exercise;

        if (!this.progressionStrategyAppliedToExercise(exercise, automaticWorkingWeights)) {
          let progressionStrategies: ProgressionStrategy[] = [];

          if (planSessionGroup && planSessionGroup.progressions) {
            progressionStrategies.push(...this.getWithMissingProgressions(planSessionGroup.progressions));
          }
          if (planSession && planSession.progressions) {
            progressionStrategies.push(...this.getWithMissingProgressions(planSession.progressions));
          }
          if (plan.progressions) {
            progressionStrategies.push(...this.getWithMissingProgressions(plan.progressions));
          }

          for (let progressionStrategy of progressionStrategies) {
            if (this.applyProgressionStrategy(exercise,
              automaticWorkingWeights, progressionStrategy)) {
              break;
            }
          }
        }
      }
    }

    return userChangedWorkingWeights.concat(automaticWorkingWeights);
  }

  getWorkoutName(start: Date, planSession: PlanSession): string {
    let name: string = "";

    if (start) {
      name += start.toLocaleDateString('en-us', { weekday: 'long' }) + "'s";
    }

    if (planSession && planSession.name) {
      name += " " + planSession.name;
    }

    name += " session";

    return name;
  }

  updateWeights(workout: Workout, workingWeights: WorkingWeight[]): void {
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
  }

  fillOutWorkingWeights(workingWeights: WorkingWeight[], planSession: PlanSession): void {
    let exercises: Exercise[] = [];
    let unit: number = null;

    if (this.authService.getUserWeightUnitId()) {
      unit = +this.authService.getUserWeightUnitId();
    }

    for (let group of planSession.groups) {
      for (let warmup of group.warmups) {
        if (exercises.filter(e => e.id == warmup.exercise.id).length == 0) {
          exercises.push(warmup.exercise);
        }
      }

      for (let set of group.exercises) {
        if (exercises.filter(e => e.id == set.exercise.id).length == 0) {
          exercises.push(set.exercise);
        }
      }
    }

    for (let exercise of exercises) {
      if (workingWeights.filter(x => x.exercise.id == exercise.id).length == 0) {
        let workingWeight = new WorkingWeight();

        workingWeight.exercise = exercise;

        if (unit) {
          workingWeight.unit = unit;
        }
        workingWeights.push(workingWeight);
      }
    }
  }

  private applyProgressionStrategy(
    exercise: Exercise,
    workingWeights: WorkingWeight[],
    progressionStrategy: ProgressionStrategy): boolean {
    let workingWeight: WorkingWeight;
    workingWeight = workingWeights.filter(ww => ww.exercise.id == exercise.id)[0];

    if (workingWeight) {
      if (this.progressionStrategyService.applies(progressionStrategy, exercise, workingWeight.unit)) {
          this.updateWorkingWeight(workingWeight, progressionStrategy);

          return true;
      }
    }

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
        workingWeight.weight = this.getWeightWithPercentage(workingWeight.previous_weight, workingWeight.previous_unit, progressionStrategy.percentage_increase);
      }
    }
  }

  private equivalentProgressionExists(progression: ProgressionStrategy, progressions: ProgressionStrategy[], unit: number) {
    return progressions.filter(x => 
        x.id != progression.id &&
        x.weight_increase &&
        x.unit == unit &&
        this.progressionStrategyService.matches(x, progression)
      ).length > 0;
  }

  private getConvertedProgression(progression: ProgressionStrategy, fromUnitId: number, toUnitId: number): ProgressionStrategy {
    let newProgression = new ProgressionStrategy(progression);
    let fromUnit= this.units.filter(u => u.id == fromUnitId)[0];
    let toUnit= this.units.filter(u => u.id == toUnitId)[0];

    newProgression.unit = toUnitId;
    newProgression.unit_code = toUnit.abbreviation;
    newProgression.weight_increase = this.unitsService.convert(newProgression.weight_increase, fromUnit, toUnit);

    return newProgression;
  }

  private getMissingProgressionsWithConvertedWeights(progressions: ProgressionStrategy[]) {
    let missingProgressions: ProgressionStrategy[] = [];

    progressions.forEach(progression => {
      if (progression.weight_increase && progression.weight_increase > 0 && progression.unit) {
        this.weightUnits.filter(u => u.id != progression.unit).map (u => {
          if (!this.equivalentProgressionExists(progression, progressions, u.id)) {
            missingProgressions.push(this.getConvertedProgression(progression, progression.unit, u.id));
          }
        });
      }
    });

    return missingProgressions;
  }

  private getWithMissingProgressions(progressions: ProgressionStrategy[]) : ProgressionStrategy[]
  {
    return [...progressions, ...this.getMissingProgressionsWithConvertedWeights(progressions)];
  }

  private getActivities(
    planActivities: PlanSessionGroupActivity[], 
    lastWorkoutActivities: WorkoutSet[]): WorkoutSet[] {
    let newActivities: WorkoutSet[] = [];
    let orders = Array.from(new Set(planActivities.map(x => x.order))).sort((a, b) => a - b);

    for (let order of orders) {
      let activities = planActivities.filter(x => x.order == order);
      let lastWorkoutSessionActivity: WorkoutSet = null;

      if (activities) {
        let sessionActivity: PlanSessionGroupActivity;

        if (activities.length == 1 || lastWorkoutActivities == null || lastWorkoutActivities.length == 0) {
          sessionActivity = activities[0];
        }
        else {
          sessionActivity = activities[0];
          lastWorkoutSessionActivity = lastWorkoutActivities.filter(x => x.order == order)[0];

          if (lastWorkoutSessionActivity) {
            let nextWorkoutSessionWarmUp = activities.filter(x => x.id > lastWorkoutSessionActivity.plan_session_group_activity)[0];
            if (nextWorkoutSessionWarmUp) {
              sessionActivity = nextWorkoutSessionWarmUp;
            }
          }
        }

        for (var i = 0; i < sessionActivity.number_of_sets; i++) {
          newActivities.push(this.getActivity(sessionActivity));
        }
      }
    }

    return newActivities;
  }

  private progressionStrategyAppliedToExercise(exercise: Exercise, workingWeights: WorkingWeight[]) {
    return workingWeights.filter(ww => ww.exercise.id == exercise.id && ww.previous_weight != null && 
      ww.previous_weight != ww.weight).length > 0;
  }

  private getActivity(sessionActivity: PlanSessionGroupActivity): WorkoutSet {
    let activity = new WorkoutSet({
      working_weight_percentage: sessionActivity.working_weight_percentage,
      order: sessionActivity.order,
      exercise: sessionActivity.exercise,
      expected_number_of_repetitions: sessionActivity.number_of_repetitions,
      expected_number_of_repetitions_up_to: sessionActivity.number_of_repetitions_up_to,
      repetition_type: sessionActivity.repetition_type,
      plan_session_group_activity: sessionActivity.id,
    }) ;

    return activity;
  }

  getWorkingWeight(workingWeights: WorkingWeight[], exercise: Exercise, percentage: number): WorkingWeight {
    let workingWeight = new WorkingWeight();
    let filteredWorkingWeight = workingWeights.filter(x => x.exercise.id == exercise.id)[0];

    workingWeight.exercise = exercise;

    if (filteredWorkingWeight) {
      workingWeight.id = filteredWorkingWeight.id;
      workingWeight.unit = filteredWorkingWeight.unit;
      workingWeight.weight = this.getWeightWithPercentage(
        filteredWorkingWeight.weight,
        filteredWorkingWeight.unit,
        percentage);
    }

    return workingWeight;
  }

  getWeightWithPercentage(weight: number, unit: number, percentage: number): number {
    if (percentage) {
      return weight * (percentage / 100);
    }

    // if we don't have a percentage... this could mean we're just using the bar
    return null;
  }
}
