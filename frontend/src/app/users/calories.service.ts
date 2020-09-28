import { Injectable } from '@angular/core';
import { Workout } from './workout';
import { Observable, forkJoin } from 'rxjs';
import { MetabolicEquivalentTask } from './metabolic-equivalent-task';
import { MetabolicEquivalentService } from './metabolic-equivalent.service';
import { map, flatMap, concatMap } from 'rxjs/operators';
import { WorkoutSet } from './workout-set';
import { UnitsService } from './units.service';
import { MeasurementType, Unit } from './unit';
import { UserBioData } from './user-bio-data';
import { User } from '../user';
import { ExerciseType } from './exercise';

@Injectable({
  providedIn: 'root'
})
export class CaloriesService {

  constructor(
    private metabolicEquivalentService: MetabolicEquivalentService,
    private unitsService: UnitsService,
  ) { }

  getAverageWeightKgs() {
    return 70;
  }

  requestActivityCalories(lastUserBioData: UserBioData, workout: Workout, activity: WorkoutSet, energy_unit: number): Observable<number> {
    let userWeightKgs = null;

    if (lastUserBioData && lastUserBioData.weight) {
      userWeightKgs = this.unitsService.convert(lastUserBioData.weight, lastUserBioData.weight_unit, 'kg');
    }

    if (!userWeightKgs) {
      userWeightKgs = this.getAverageWeightKgs();
    }

    return this
        .metabolicEquivalentService
        .getMets(activity.exercise.id)
    .pipe(
      concatMap(mets => 
        new Observable<number>(o => {
          o.next(+this.getActivityCalories(userWeightKgs, workout, activity, mets, energy_unit));
          o.complete();
        })
      )
    );
  }

  requestWorkoutCalories(lastUserBioData: UserBioData, workout: Workout, energy_unit: number): Observable<number> {
    let userWeightKgs = null;

    if (lastUserBioData && lastUserBioData.weight) {
      userWeightKgs = this.unitsService.convert(lastUserBioData.weight, lastUserBioData.weight_unit, 'kg');
    }

    if (!userWeightKgs) {
      userWeightKgs = this.getAverageWeightKgs();
    }

    const warmups = workout.groups.flatMap(w => w.warmups.map(s => s)) ?? [];
    const sets = workout.groups.flatMap(w => w.sets.map(s => s)) ?? [];

    const activities = [...warmups, ...sets];

    return forkJoin (activities.map(activity => this.requestActivityCalories(lastUserBioData, workout, activity, energy_unit)))
    .pipe(
      flatMap(calories => 
        new Observable<number>(o => {
          o.next(calories.reduce((a,b) => a + b, 0));
          o.complete();
        })
      )
    );
  }

  getActivityCalories(userWeightKgs: number, workout: Workout, activity: WorkoutSet, mets: MetabolicEquivalentTask[], energy_unit: number): number {
    if (!mets) {
      return 0;
    }
    const warmups = workout.groups.flatMap(w => w.warmups.map(s => s)) ?? [];
    const sets = workout.groups.flatMap(w => w.sets.map(s => s)) ?? [];

    const activities = [...warmups, ...sets];

    let start: Date;
    let end: Date;
    let distance: number = activity.distance;
    let distance_unit = activity.distance_unit;
    
    start = activity.start;
    end = activity.end;

    let milliseconds = null;
    let hours = null;
    
    if (activity.exercise.exercise_type == ExerciseType.Strength && activity.number_of_repetitions && activity.number_of_repetitions > 0) {
      // if it's a strength type reps based exercise we calculate a fix time per rep
      const ms_per_rep = 3000;

      milliseconds = ms_per_rep * activity.number_of_repetitions;
    }
    else if (activity.time) {
      milliseconds = this.unitsService.convert(activity.time, activity.time_unit, 'ms');
    }
    else if (activity.speed && activity.distance) {
      // don't have the time, but I have the speed and the distance, so I'll use that to calculate it
      let kms = this.unitsService.convert(activity.distance, activity.distance_unit, 'km');
      let speed = this.unitsService.convert(activity.speed, activity.speed_unit, 'km/h');

      hours = (kms / speed);
    }
    else if (start && end) {
      milliseconds = end.valueOf() - start.valueOf();
    }
    else if (workout.start && workout.end) {
      let activitiesWithTime = activities.filter(x => x.time);
      let totalWorkoutTimeMs = (workout.end.valueOf() - workout.start.valueOf());
      let totalActivitiesWithTimeMs = activitiesWithTime.reduce((a,b) => a + this.unitsService.convert(b.time, b.time_unit, 'ms'), 0);

      if (activities.length - activitiesWithTime.length > 0) {
        milliseconds = (totalWorkoutTimeMs - totalActivitiesWithTimeMs) / (activities.length - activitiesWithTime.length);
      }
    }

    if (milliseconds && !hours) {
      hours = milliseconds / 1000 / 60 / 60;
    }

    let units = this.unitsService.getUnitList();
    let met: MetabolicEquivalentTask = null;
    
    if (!hours) {
      return 0;
    }

    if (activity.met_set_by_user) {
      met = mets.filter(x => x.id == activity.met)[0];
    }
    else {
      met = this.getMet(distance, distance_unit, mets, units, hours, met);
    }

    if (met) {
      activity.met = met.id;
    }
    else {
      activity.met = null;
    }

    if (!met) {
      return 0;
    }

    if (!userWeightKgs) {
      return 0;
    }

    if (hours <= 0) {
      return 0;
    }

    return this.unitsService.convert(Math.round(met.met * userWeightKgs * hours), 'kcal', energy_unit);
  }

  private getMet(distance: number, distance_unit: number, mets: MetabolicEquivalentTask[], units: Unit[], hours: number, met: MetabolicEquivalentTask) {
    let autoMets = mets.filter(x => x.can_be_automatically_selected);

    if (distance &&
      distance_unit &&
      autoMets
        .filter(x => x.unit &&
          units
            .filter(u => x.unit == u.id && u.measurement_type == MeasurementType.Speed)
            .length > 0)
        .length > 0) {
      // we've got mets for a specific speed
      let speedParameters = [...new Set(autoMets
        .filter(x => x.unit)
        .map(x => x.unit))]
        .map(unit => ({ unit, distance: this.unitsService.convert(distance, distance_unit, unit) }))
        .map(x => ({ unit: x.unit, distance: x.distance, speed: x.distance / hours }));

      // is our distance within a met's range?
      speedParameters.some(sp => {
        met = autoMets
          .filter(m => m.unit == sp.unit && m.from_value && m.to_value)
          .filter(m => m.from_value >= sp.speed && m.to_value <= sp.speed)[0];

        return met != null;
      });

      if (!met) {
        speedParameters.some(sp => {
          let metsWithValues = autoMets
            .filter(x => x.unit == sp.unit && x.from_value || x.to_value)
            .map(x => ({ met: x, value: x.from_value ? x.from_value : x.to_value }));

          // is our distance exactly the same as a from or to value?
          metsWithValues
            .sort((a, b) => a.value - b.value)
            .some(m => {
              if (m.value == sp.speed) {
                met = m.met;
              }

              return met != null;
            });

          if (!met) {
            // is our distance bigger than a from value?
            metsWithValues
              .filter(m => m.met.from_value)
              .sort((a, b) => b.met.from_value - a.met.from_value)
              .some(m => {
                if (sp.speed >= m.met.from_value) {
                  met = m.met;
                }

                return met != null;
              });
          }

          if (!met) {
            // is our distance smaller than a to value?
            metsWithValues
              .filter(m => m.met.from_value)
              .sort((a, b) => a.met.to_value - b.met.to_value)
              .some(m => {
                if (sp.speed <= m.met.to_value) {
                  met = m.met;
                }

                return met != null;
              });
          }
        });
      }

    }

    if (!met) {
      // when all else fails, let's try and see if we have a general MET
      met = autoMets
        .filter(x => x.description.includes('general'))
        .sort((a, b) => a.description.length - b.description.length)[0];
    }

    if (!met) {
      // ok, whatever, we'll select the first one and be done with it.
      met = autoMets[0];
    }
    return met;
  }
}
