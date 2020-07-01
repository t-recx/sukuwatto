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

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  private units: Unit[];

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
    const toUnitCode = this.getToUnitCode(this.getUnitCode(fromUnit));

    return this.units.filter(u => u.abbreviation == toUnitCode)[0].id;
  }

  getToUnitCode(fromUnit: string) {
    let toUnitCode = fromUnit;

    if (this.authService.isLoggedIn()) {
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
            toUnitCode = 'mi';
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
            toUnitCode = 'km';
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

    let toUnitCode = this.getToUnitCode(fromUnitCode);

    if (toUnitCode != fromUnitCode) {
      let num = uz(value + fromUnitCode).convert(toUnitCode).value;

      return this.roundValue(num, fromUnitCode, toUnitCode);
    }

    return value;
  }

  convert(value: any, fromUnit: any, toUnit: any) {
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

    if (toUnitCode != fromUnitCode) {
      let num = uz(value + fromUnitCode).convert(toUnitCode).value;

      return this.roundValue(num, fromUnitCode, toUnitCode);
    }

    return value;
  }

  roundValue(num: number, fromUnitCode: string, toUnitCode: string): number {
    return Math.round((num + Number.EPSILON) * 1000) / 1000;
  }

  convertWorkout(workout: Workout) {
    if (workout) {
      workout.start = new Date(workout.start);

      if (workout.groups) {
        workout.groups.forEach(group => {
          if (group.sets) {
            group.sets.forEach(s => {
              this.convertWeightValue(s);
              this.convertSpeedValue(s);
              this.convertDistanceValue(s);
            });
          }
          if (group.warmups) {
            group.warmups.forEach(s => {
              this.convertWeightValue(s);
              this.convertSpeedValue(s);
              this.convertDistanceValue(s);
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

  convertWorkoutOverview(workoutOverview: WorkoutOverview) {
    if (!workoutOverview) {
      return;
    }

    this.convertWeightValue(workoutOverview);
  }

  convertUserBioData(userBioData: UserBioData) {
    if (!userBioData) {
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
    return this.units.filter(x => x.id == id)[0].abbreviation;
  }
}
