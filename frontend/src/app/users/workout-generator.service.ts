import { Injectable } from '@angular/core';
import { Workout } from './workout';
import { PlanSession } from './plan-session';
import { WorkoutsService } from './workouts.service';
import { WorkingParameter } from './working-parameter';
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

  generate(start: Date, workingParameters: WorkingParameter[], plan: Plan, planSession: PlanSession): Observable<Workout> {
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

          workout.working_parameters = this.getClonedWorkingParameters(workingParameters);
          if (workout.working_parameters) {
            workout.working_parameters.forEach(ww => {
                ww.previous_unit = ww.unit;
                ww.previous_unit_code = ww.unit_code;
                ww.previous_parameter_value = ww.parameter_value;
            });
          }

          this.fillOutWorkingParameters(workout.working_parameters, planSession);

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

          workout.working_parameters = this.getWorkingParametersWithProgressions(workout.working_parameters, workout, plan);

          this.updateWeights(workout, workout.working_parameters);

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

          workout.groups = 
            [
              ...workout.groups.filter(x => x.plan_session_group != workoutGroup.plan_session_group),
              this.generateGroup(planSessionGroup, lastWorkoutGroupForPlanSessionGroup.order ? lastWorkoutGroupForPlanSessionGroup : null)
            ].sort((a, b) => a.order - b.order);

          workout.working_parameters = this.getWorkingParametersWithProgressions(workout.working_parameters, workout, plan);

          this.updateWeights(workout, workout.working_parameters);

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

  getClonedWorkingParameters(workingParameters: WorkingParameter[]): WorkingParameter[] {
    return workingParameters.map(ww => new WorkingParameter(ww));
  }

  getWorkingParametersWithProgressions(
    workingParameters: WorkingParameter[],
    workout: Workout,
    plan: Plan) : WorkingParameter[] {
    let newWorkingParameters = this.getClonedWorkingParameters(workingParameters);
    let userChangedWorkingParameters = newWorkingParameters.filter(x => x.manually_changed);
    let automaticWorkingParameters = newWorkingParameters.filter(x => !x.manually_changed);
    let planSession = plan.sessions.filter(p => p.id == workout.plan_session)[0];

    for (let group of workout.groups) {
      for (let set of group.sets) {
        let planSessionGroup = null;
        if (planSession) {
          planSessionGroup = planSession.groups.filter(p => p.id == group.plan_session_group)[0];
        }
        const exercise = set.exercise;

        if (!this.progressionStrategyAppliedToExercise(exercise, automaticWorkingParameters)) {
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
              automaticWorkingParameters, progressionStrategy)) {
              break;
            }
          }
        }
      }
    }

    let joined = userChangedWorkingParameters.concat(automaticWorkingParameters);

    let withExercisesInWorkout = joined.filter(ww => workout.groups.filter(g => g.sets.filter(s => s.exercise.id == ww.exercise.id).length > 0).length > 0);
    let withoutExercisesInWorkout = joined.filter(ww => workout.groups.filter(g => g.sets.filter(s => s.exercise.id == ww.exercise.id).length > 0).length == 0);

    withExercisesInWorkout = withExercisesInWorkout.sort((a, b) => a.exercise.name.localeCompare(b.exercise.name));
    withoutExercisesInWorkout = withoutExercisesInWorkout.sort((a, b) => a.exercise.name.localeCompare(b.exercise.name));

    return withExercisesInWorkout.concat(withoutExercisesInWorkout);
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

  updateWeights(workout: Workout, workingParameters: WorkingParameter[]): void {
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
          let workingParameter = this.getWorkingParameter(workingParameters, set.exercise, 
            set.working_parameter_percentage);
          if (workingParameter) {
            set.weight = workingParameter.parameter_value;
            set.unit = workingParameter.unit;
            set.unit_code = this.units.filter(u => u.id == set.unit)[0].abbreviation;
          }
        }
      }
    }
  }

  fillOutWorkingParameters(workingParameters: WorkingParameter[], planSession: PlanSession): void {
    let exercises: Exercise[] = [];
    let unit: number = null;
    let unit_code: string = null;

    if (this.authService.getUserWeightUnitId()) {
      unit = +this.authService.getUserWeightUnitId();
      unit_code = this.units.filter(u => u.id == unit)[0].abbreviation;
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
      if (workingParameters.filter(x => x.exercise.id == exercise.id).length == 0) {
        let workingParameter = new WorkingParameter();

        workingParameter.exercise = exercise;

        if (unit) {
          workingParameter.unit = unit;
          workingParameter.unit_code = unit_code;
        }
        workingParameters.push(workingParameter);
      }
    }
  }

  private applyProgressionStrategy(
    exercise: Exercise,
    workingParameters: WorkingParameter[],
    progressionStrategy: ProgressionStrategy): boolean {
    let workingParameter: WorkingParameter;
    workingParameter = workingParameters.filter(ww => ww.exercise.id == exercise.id)[0];

    if (workingParameter) {
      if (this.progressionStrategyService.applies(progressionStrategy, exercise, workingParameter.unit)) {
          this.updateWorkingParameter(workingParameter, progressionStrategy);

          return true;
      }
    }

    return false;
  }

  private updateWorkingParameter(workingParameter: WorkingParameter, progressionStrategy: ProgressionStrategy) {
    workingParameter.previous_parameter_value = workingParameter.parameter_value;
    workingParameter.previous_unit = workingParameter.unit;
    if (workingParameter.parameter_value) {
      if (progressionStrategy.parameter_increase && progressionStrategy.unit == workingParameter.unit) {
        workingParameter.parameter_value += progressionStrategy.parameter_increase;
      }
      else if (progressionStrategy.percentage_increase) {
        workingParameter.parameter_value = this.getWeightWithPercentage(workingParameter.previous_parameter_value, workingParameter.previous_unit, progressionStrategy.percentage_increase);
      }
    }
  }

  private equivalentProgressionExists(progression: ProgressionStrategy, progressions: ProgressionStrategy[], unit: number) {
    return progressions.filter(x => 
        x.id != progression.id &&
        x.parameter_increase &&
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
    newProgression.parameter_increase = this.unitsService.convert(newProgression.parameter_increase, fromUnit, toUnit);

    return newProgression;
  }

  private getMissingProgressionsWithConvertedWeights(progressions: ProgressionStrategy[]) {
    let missingProgressions: ProgressionStrategy[] = [];

    progressions.forEach(progression => {
      if (progression.parameter_increase && progression.parameter_increase > 0 && progression.unit) {
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

  private progressionStrategyAppliedToExercise(exercise: Exercise, workingParameters: WorkingParameter[]) {
    return workingParameters.filter(ww => ww.exercise.id == exercise.id && ww.previous_parameter_value != null && 
      ww.previous_parameter_value != ww.parameter_value).length > 0;
  }

  private getActivity(sessionActivity: PlanSessionGroupActivity): WorkoutSet {
    let activity = new WorkoutSet({
      working_parameter_percentage: sessionActivity.working_parameter_percentage,
      order: sessionActivity.order,
      exercise: sessionActivity.exercise,
      expected_number_of_repetitions: sessionActivity.number_of_repetitions,
      expected_number_of_repetitions_up_to: sessionActivity.number_of_repetitions_up_to,
      repetition_type: sessionActivity.repetition_type,
      plan_session_group_activity: sessionActivity.id,
    }) ;

    return activity;
  }

  getWorkingParameter(workingParameters: WorkingParameter[], exercise: Exercise, percentage: number): WorkingParameter {
    let workingParameter = new WorkingParameter();
    let filteredWorkingParameter = workingParameters.filter(x => x.exercise.id == exercise.id)[0];

    workingParameter.exercise = exercise;

    if (filteredWorkingParameter) {
      workingParameter.id = filteredWorkingParameter.id;
      workingParameter.unit = filteredWorkingParameter.unit;
      workingParameter.unit_code = this.units.filter(u => u.id == workingParameter.unit)[0].abbreviation;
      workingParameter.parameter_value = this.getWeightWithPercentage(
        filteredWorkingParameter.parameter_value,
        filteredWorkingParameter.unit,
        percentage);
    }

    return workingParameter;
  }

  getWeightWithPercentage(weight: number, unit: number, percentage: number): number {
    if (percentage == 100) {
      return weight;
    }

    if (percentage) {
      return Math.round(weight * (percentage / 100));
    }

    // if we don't have a percentage... this could mean we're just using the bar
    return null;
  }
}
