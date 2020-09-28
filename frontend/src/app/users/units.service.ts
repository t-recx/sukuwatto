import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Unit, MeasurementType } from './unit';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { MeasurementSystem } from '../user';
import { uz, Classes } from 'unitz-ts';
import { Workout } from './workout';
import { WorkoutOverview } from './workout-activity-resumed';
import { UserBioData } from './user-bio-data';
import { Plan } from './plan';
import { ProgressionStrategy } from './plan-progression-strategy';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  private units: Unit[];

  public monthInMilliseconds: number = 2592000000;

  constructor(
    private authService: AuthService,
  ) {
    Classes.addDefaults();
    this.initUnits();
  }

  initUnits() {
    this.units = [
      {
        id: 1,
        name: "Kilogram",
        abbreviation: "kg",
        system: MeasurementSystem.Metric,
        measurement_type: MeasurementType.Weight
      },
      {
        id: 2,
        name: "Pound",
        abbreviation: "lb",
        system: MeasurementSystem.Imperial,
        measurement_type: MeasurementType.Weight
      },
      {
        id: 3,
        name: "Centimeter",
        abbreviation: "cm",
        system: MeasurementSystem.Metric,
        measurement_type: MeasurementType.Height
      },
      {
        id: 4,
        name: "Feet",
        abbreviation: "ft",
        system: MeasurementSystem.Imperial,
        measurement_type: MeasurementType.Height
      },
      {
        id: 5,
        name: "Kilometer",
        abbreviation: "km",
        system: MeasurementSystem.Metric,
        measurement_type: MeasurementType.Distance
      },
      {
        id: 6,
        name: "Mile",
        abbreviation: "mi",
        system: MeasurementSystem.Imperial,
        measurement_type: MeasurementType.Distance
      },
      {
        id: 7,
        name: "Minute",
        abbreviation: "min",
        system: MeasurementSystem.Metric,
        measurement_type: MeasurementType.Time
      },
      {
        id: 8,
        name: "Meter",
        abbreviation: "m",
        system: MeasurementSystem.Metric,
        measurement_type: MeasurementType.Distance
      },
      {
        id: 9,
        name: "Second",
        abbreviation: "s",
        system: MeasurementSystem.Metric,
        measurement_type: MeasurementType.Time
      },
      {
        id: 10,
        name: "Yard",
        abbreviation: "yd",
        system: MeasurementSystem.Imperial,
        measurement_type: MeasurementType.Distance
      },
      {
        id: 11,
        name: "Km/hour",
        abbreviation: "km/h",
        system: MeasurementSystem.Metric,
        measurement_type: MeasurementType.Speed
      },
      {
        id: 12,
        name: "Miles/hour",
        abbreviation: "mph",
        system: MeasurementSystem.Imperial,
        measurement_type: MeasurementType.Speed
      },
      {
        id: 13,
        name: "Milliseconds",
        abbreviation: "ms",
        system: MeasurementSystem.Metric,
        measurement_type: MeasurementType.Time
      },
      {
        id: 14,
        name: "Hour",
        abbreviation: "hr",
        system: MeasurementSystem.Metric,
        measurement_type: MeasurementType.Time
      },
      {
        id: 15,
        name: "Kilocalories",
        abbreviation: "kcal",
        system: MeasurementSystem.Metric,
        measurement_type: MeasurementType.Energy
      },
      {
        id: 16,
        name: "Kilojoules",
        abbreviation: "kJ",
        system: MeasurementSystem.Metric,
        measurement_type: MeasurementType.Energy
      },
    ];
  }

  getUnits(): Observable<Unit[]> {
    return new Observable<Unit[]>(obs => {
      obs.next(this.units);
      obs.complete();
    });
  }

  getUnitList(): Unit[] {
    return this.units;
  }

  getUserWeightUnitCode(): string {
    if (this.authService.getUserUnitSystem() == MeasurementSystem.Imperial) {
      return 'lb';
    }

    return 'kg';
  }

  getToUnit(fromUnit: number) {
    if (fromUnit) {
      const toUnitCode = this.getToUnitCode(this.getUnitCode(fromUnit));

      return this.units.filter(u => u.abbreviation == toUnitCode)[0].id;
    }
    else {
      return fromUnit;
    }
  }

  getToUnitCode(fromUnit: string) {
    let toUnitCode = fromUnit;

    if (this.authService.isLoggedIn()) {
      if (this.authService.getUserEnergyUnitId()) {
        if (+this.authService.getUserEnergyUnitId() == this.units.filter(u => u.abbreviation == 'kJ')[0].id) {
          if (fromUnit == 'kcal') {
            toUnitCode = 'kJ';
          }
        }
        else {
          if (fromUnit == 'kJ') {
            toUnitCode = 'kcal';
          }
        }
      }
      else {
        // if no unit use kcal by default
        if (fromUnit == 'kJ') {
          toUnitCode = 'kcal';
        }
      }

      if (this.authService.getUserUnitSystem() == MeasurementSystem.Imperial) {
        switch (fromUnit) {
          case 'kg':
            toUnitCode = 'lb';
            break;
          case 'cm':
            toUnitCode = 'ft';
            break;
          case 'km':
            toUnitCode = 'mi';
            break;
          case 'km/h':
            toUnitCode = 'mph';
            break;
          case 'm':
            toUnitCode = 'yd';
            break;
        }
      }
      else if (this.authService.getUserUnitSystem() == MeasurementSystem.Metric) {
        switch (fromUnit) {
          case 'ft':
            toUnitCode = 'cm';
            break;
          case 'lb':
            toUnitCode = 'kg';
            break;
          case 'mi':
            toUnitCode = 'km';
            break;
          case 'yd':
            toUnitCode = 'm';
            break;
          case 'mph':
            toUnitCode = 'km/h';
            break;
        }
      }
    }

    return toUnitCode;
  }

  convertToUserUnit(value: any, fromUnit: any) {
    let fromUnitCode = '';

    if (fromUnit.abbreviation) {
      fromUnitCode = fromUnit.abbreviation;
    }
    else if (typeof fromUnit === 'number') {
      fromUnitCode = this.getUnitCode(fromUnit);
    }
    else {
      fromUnitCode = fromUnit;
    }

    return this.convert(value, fromUnitCode, this.getToUnitCode(fromUnitCode));
  }

  convert(value: number, fromUnit: any, toUnit: any) {
    let fromUnitCode = '';

    if (fromUnit.abbreviation) {
      fromUnitCode = fromUnit.abbreviation;
    }
    else if (typeof fromUnit === 'number') {
      fromUnitCode = this.getUnitCode(fromUnit);
    }
    else {
      fromUnitCode = fromUnit;
    }

    let toUnitCode = '';

    if (toUnit.abbreviation) {
      toUnitCode = toUnit.abbreviation;
    }
    else if (typeof toUnit === 'number') {
      toUnitCode = this.getUnitCode(toUnit);
    }
    else {
      toUnitCode = toUnit;
    }

    fromUnitCode = fromUnitCode == 'mph' ? 'mi' : fromUnitCode;
    fromUnitCode = fromUnitCode == 'km/h' ? 'km' : fromUnitCode;
    toUnitCode = toUnitCode == 'mph' ? 'mi' : toUnitCode;
    toUnitCode = toUnitCode == 'km/h' ? 'km' : toUnitCode;

    return this.unitConversion(value, fromUnitCode, toUnitCode);
  }

  unitConversion(value: number, fromUnitCode: string, toUnitCode: string): number {
    value = Number(value);
    let num = 0;

    if (fromUnitCode == toUnitCode) {
      return value;
    }
    
    if (fromUnitCode == null || toUnitCode == null) {
      return value;
    }

    if (fromUnitCode == 'kcal' && toUnitCode == 'kJ') {
      num = value * 4.18400;
    }
    else if (fromUnitCode == 'kJ' && toUnitCode == 'kcal') {
      num = value * 0.239005736;
    }
    else {
      num = uz(value + fromUnitCode).convert(toUnitCode).value;
    }

    return this.roundValue(num, fromUnitCode, toUnitCode);
  }

  roundValue(num: number, fromUnitCode: string, toUnitCode: string): number {
    if (fromUnitCode == 'kcal' && toUnitCode == 'kJ') {
      return Math.round(num);
    }
    else if (fromUnitCode == 'kJ' && toUnitCode == 'kcal') {
      return Math.round(num);
    }

    return Math.round((num + Number.EPSILON) * 1000) / 1000;
  }

  convertPlan(plan: Plan): Plan {
    if (plan) {
      this.convertProgressionStrategies(plan.progressions);
      if (plan.sessions) {
        plan.sessions.forEach(session => {
          this.convertProgressionStrategies(session.progressions);
          if (session.groups) {
            session.groups.forEach(group => {
              const activities = [...(group.exercises ?? []), ...(group.warmups ?? [])]

              activities.forEach(s => {
                this.convertPlanSpeedValue(s);
                this.convertPlanDistanceValue(s);
              });

              this.convertProgressionStrategies(group.progressions);
            });
          }
        });
      }
    }

    return plan;
  }

  getUserEnergyUnit(): number {
    const kcal = this.units.filter(x => x.abbreviation == 'kcal')[0];
    const kjoules = this.units.filter(x => x.abbreviation == 'kJ')[0];
    let energyUnitID: number;

    if (this.authService.isLoggedIn() && this.authService.getUserEnergyUnitId()) {
      const userUnit = this.units.filter(u => u.id == +this.authService.getUserEnergyUnitId())[0];

      if (userUnit && userUnit.abbreviation == 'kJ') {
        energyUnitID = kjoules.id;
      }
      else {
        energyUnitID = kcal.id;
      }
    }
    else {
      energyUnitID = kcal.id;
    }

    return energyUnitID;
  }

  convertEnergyUnit(model: any) {
    if (model.energy_unit) {
      if (model.calories) {
        model.calories = this.convertToUserUnit(model.calories, model.energy_unit);
      }

      model.energy_unit = this.getToUnit(model.energy_unit);
    }
  }

  convertWorkout(workout: Workout) {
    if (workout) {
      workout.start = new Date(workout.start);

      this.convertEnergyUnit(workout);

      if (workout.groups) {
        workout.groups.forEach(group => {
          if (group.sets) {
            group.sets.forEach(s => {
              this.convertWeightValue(s);
              this.convertSpeedValue(s);
              this.convertDistanceValue(s);
              this.convertEnergyUnit(s);
            });
          }
          if (group.warmups) {
            group.warmups.forEach(s => {
              this.convertWeightValue(s);
              this.convertSpeedValue(s);
              this.convertDistanceValue(s);
              this.convertEnergyUnit(s);
            });
          }
        });
      }
      if (workout.working_parameters) {
        workout.working_parameters.forEach(ww => {
          this.convertParameterValue(ww);
          if (ww.previous_parameter_value) {
            ww.previous_parameter_value = this.convertToUserUnit(ww.previous_parameter_value, ww.previous_unit);
          }
          if (ww.previous_unit) {
            ww.previous_unit = this.getToUnit(ww.previous_unit);
          }
        });
      }
    }

    return workout;
  }
  
  convertWorkoutDistanceToBiggerUnits(workout: Workout): Workout {
    if (workout) {
      if (workout.groups) {
        workout.groups.forEach(group => {
          if (group.sets) {
            group.sets.forEach(s => {
              this.convertDistanceValueToBiggerUnit(s);
            });
          }
          if (group.warmups) {
            group.warmups.forEach(s => {
              this.convertDistanceValueToBiggerUnit(s);
            });
          }
        });
      }
    }

    return workout;
  }

  convertWorkoutOverview(workoutOverview: WorkoutOverview) {
    if (!workoutOverview) {
      return;
    }

    this.convertWeightValue(workoutOverview);
  }

  convertUserBioData(userBioData: UserBioData): UserBioData {
    if (userBioData) {
      if (userBioData.weight && userBioData.weight_unit) {
        userBioData.weight = this.convertToUserUnit(userBioData.weight, userBioData.weight_unit);
        userBioData.weight_unit = this.getToUnit(userBioData.weight_unit);
      }

      if (userBioData.height && userBioData.height_unit) {
        userBioData.height = this.convertToUserUnit(userBioData.height, userBioData.height_unit);
        userBioData.height_unit = this.getToUnit(userBioData.height_unit);
      }

      if (userBioData.bone_mass_weight && userBioData.bone_mass_weight_unit) {
        userBioData.bone_mass_weight = this.convertToUserUnit(userBioData.bone_mass_weight, userBioData.bone_mass_weight_unit);
        userBioData.bone_mass_weight_unit = this.getToUnit(userBioData.bone_mass_weight_unit);
      }
    }

    return userBioData;
  }

  convertWeightValue(model: { weight: number, weight_unit: number }) {
    if (model) {
      if (model.weight) {
        model.weight = this.convertToUserUnit(model.weight, model.weight_unit);
      }
      if (model.weight_unit) {
        model.weight_unit = this.getToUnit(model.weight_unit);
      }
    }
  }

  convertDistanceValue(model: { distance: number, expected_distance: number, expected_distance_up_to: number, distance_unit: number, plan_distance_unit: number }) {
    if (model) {
      if (model.plan_distance_unit) {
        if (model.expected_distance) {
          model.expected_distance = this.convertToUserUnit(model.expected_distance, model.plan_distance_unit);
        }
        if (model.expected_distance_up_to) {
          model.expected_distance_up_to = this.convertToUserUnit(model.expected_distance_up_to, model.plan_distance_unit);
        }
        model.plan_distance_unit = this.getToUnit(model.plan_distance_unit);
      }

      if (model.distance_unit) {
        if (model.distance) {
          model.distance = this.convertToUserUnit(model.distance, model.distance_unit);
        }
        model.distance_unit = this.getToUnit(model.distance_unit);
      }
    }
  }

  getBiggerDistanceUnit(unit) {
    const unitCode = this.getUnitCode(unit);
    let newUnitCode = unitCode;

    switch (unitCode) {
      case 'ft':
      case 'yd':
        newUnitCode = 'mi';
        break;
      case 'm':
        newUnitCode = 'km';
        break;
    }

    return this.units.filter(x => x.abbreviation == newUnitCode)[0].id;
  }

  convertDistanceValueToBiggerUnit(model: { distance: number, expected_distance: number, expected_distance_up_to: number, distance_unit: number, plan_distance_unit: number }) {
    if (model) {
      if (model.plan_distance_unit) {
        const newUnit = this.getBiggerDistanceUnit(model.plan_distance_unit);

        if (model.expected_distance) {
          model.expected_distance = this.convert(model.expected_distance, model.plan_distance_unit, newUnit);
        }
        if (model.expected_distance_up_to) {
          model.expected_distance_up_to = this.convert(model.expected_distance_up_to, model.plan_distance_unit, newUnit);
        }
        model.plan_distance_unit = newUnit;
      }

      if (model.distance_unit) {
        const newUnit = this.getBiggerDistanceUnit(model.distance_unit);

        if (model.distance) {
          model.distance = this.convert(model.distance, model.distance_unit, newUnit);
        }
        model.distance_unit = newUnit;
      }
    }
  }

  convertProgressionStrategies(models: ProgressionStrategy[]) {
    if (models) {
      models.forEach(m => this.convertProgressionStrategy(m));
    }
  }

  convertProgressionStrategy(model: ProgressionStrategy) {
    if (model) {
      if (model.unit) {
        model.unit = this.getToUnit(model.unit);
        if (model.parameter_increase) {
          model.parameter_increase = this.convertToUserUnit(model.parameter_increase, model.unit);
        }
      }
    }
  }

  convertPlanSpeedValue(model: { speed: number, speed_up_to: number, speed_unit: number }) {
    if (model) {
      if (model.speed_unit) {
        if (model.speed) {
          model.speed = this.convertToUserUnit(model.speed, model.speed_unit);
        }
        if (model.speed_up_to) {
          model.speed_up_to = this.convertToUserUnit(model.speed_up_to, model.speed_unit);
        }
        model.speed_unit = this.getToUnit(model.speed_unit);
      }
    }
  }

  convertPlanDistanceValue(model: { distance: number, distance_up_to: number, distance_unit: number }) {
    if (model) {
      if (model.distance_unit) {
        if (model.distance) {
          model.distance = this.convertToUserUnit(model.distance, model.distance_unit);
        }
        if (model.distance_up_to) {
          model.distance_up_to = this.convertToUserUnit(model.distance_up_to, model.distance_unit);
        }
        model.distance_unit = this.getToUnit(model.distance_unit);
      }
    }
  }

  convertSpeedValue(model: { speed: number, expected_speed: number, expected_speed_up_to: number, speed_unit: number, plan_speed_unit: number }) {
    if (model) {
      if (model.plan_speed_unit) {
        if (model.expected_speed) {
          model.expected_speed = this.convertToUserUnit(model.expected_speed, model.plan_speed_unit);
        }
        if (model.expected_speed_up_to) {
          model.expected_speed_up_to = this.convertToUserUnit(model.expected_speed_up_to, model.plan_speed_unit);
        }
        model.plan_speed_unit = this.getToUnit(model.plan_speed_unit);
      }

      if (model.speed_unit) {
        if (model.speed) {
          model.speed = this.convertToUserUnit(model.speed, model.speed_unit);
        }
        model.speed_unit = this.getToUnit(model.speed_unit);
      }
    }
  }

  convertParameterValue(model: { parameter_value: number, unit: number }) {
    if (model) {
      if (model.parameter_value) {
        model.parameter_value = this.convertToUserUnit(model.parameter_value, model.unit);
      }
      if (model.unit) {
        model.unit = this.getToUnit(model.unit);
      }
    }
  }

  getUnitCode(id: number): string {
    if (!id) {
      return null;
    }

    const filteredUnits = this.units.filter(x => x.id == id);

    if (filteredUnits.length == 0) {
      return null;
    }

    return filteredUnits[0].abbreviation;
  }
}
