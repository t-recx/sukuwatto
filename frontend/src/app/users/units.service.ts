import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Unit, MeasurementType } from './unit';
import { AuthService } from '../auth.service';
import { MeasurementSystem } from '../user';
import { Workout } from './workout';
import { WorkoutOverview } from './workout-activity-resumed';
import { UserBioData } from './user-bio-data';
import { Plan } from './plan';
import { ProgressionStrategy } from './plan-progression-strategy';
import { UnitConversion } from './unit-conversion';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  private units: Unit[];
  private unitConversions: UnitConversion[];

  public monthInMilliseconds: number = 2592000000;

  constructor(
    private authService: AuthService,
  ) {
    this.initUnits();
    this.initUnitConversions();
  }

  initUnitConversions() {
    this.unitConversions = [
      {
        from: 'kg',
        to: 'lb',
        multiplier: 2.20462262
      },
      {
        from: 'lb',
        to: 'kg',
        multiplier: 0.45359237
      },
      {
        from: 'cm',
        to: 'km',
        multiplier: 0.00001
      },
      {
        from: 'km',
        to: 'cm',
        multiplier: 100000
      },
      {
        from: 'cm',
        to: 'mi',
        multiplier: 0.000006214
      },
      {
        from: 'mi',
        to: 'cm',
        multiplier: 160934.4
      },
      {
        from: 'cm',
        to: 'm',
        multiplier: 0.01
      },
      {
        from: 'm',
        to: 'cm',
        multiplier: 100
      },
      {
        from: 'cm',
        to: 'yd',
        multiplier: 0.010936133
      },
      {
        from: 'yd',
        to: 'cm',
        multiplier: 91.44
      },
      {
        from: 'cm',
        to: 'ft',
        multiplier: 0.032808399
      },
      {
        from: 'ft',
        to: 'cm',
        multiplier: 30.48
      },
      {
        from: 'm',
        to: 'ft',
        multiplier: 3.2808399
      },
      {
        from: 'ft',
        to: 'm',
        multiplier: 0.3048
      },
      {
        from: 'km',
        to: 'ft',
        multiplier: 3280.8399
      },
      {
        from: 'ft',
        to: 'km',
        multiplier: 0.0003048
      },
      {
        from: 'yd',
        to: 'ft',
        multiplier: 3
      },
      {
        from: 'ft',
        to: 'yd',
        multiplier: 0.333333333
      },
      {
        from: 'mi',
        to: 'ft',
        multiplier: 5280
      },
      {
        from: 'ft',
        to: 'mi',
        multiplier: 0.000189393939
      },
      {
        from: 'km',
        to: 'mi',
        multiplier: 0.621371192
      },
      {
        from: 'mi',
        to: 'km',
        multiplier: 1.609344
      },
      {
        from: 'km',
        to: 'm',
        multiplier: 1000
      },
      {
        from: 'm',
        to: 'km',
        multiplier: 0.001
      },
      {
        from: 'km',
        to: 'yd',
        multiplier: 1093.6133
      },
      {
        from: 'yd',
        to: 'km',
        multiplier: 0.0009144
      },
      {
        from: 'mi',
        to: 'm',
        multiplier: 1609.344
      },
      {
        from: 'm',
        to: 'mi',
        multiplier: 0.000621371192
      },
      {
        from: 'mi',
        to: 'yd',
        multiplier: 1760
      },
      {
        from: 'yd',
        to: 'mi',
        multiplier: 0.000568181818
      },
      {
        from: 'm',
        to: 'yd',
        multiplier: 1.0936133
      },
      {
        from: 'yd',
        to: 'm',
        multiplier: 0.9144
      },
      {
        from: 'min',
        to: 's',
        multiplier: 60
      },
      {
        from: 's',
        to: 'min',
        multiplier: 0.0166666667
      },
      {
        from: 'min',
        to: 'ms',
        multiplier: 60000
      },
      {
        from: 'ms',
        to: 'min',
        multiplier: 0.00001666666
      },
      {
        from: 'min',
        to: 'hr',
        multiplier: 0.0166666667
      },
      {
        from: 'hr',
        to: 'min',
        multiplier: 60
      },
      {
        from: 's',
        to: 'ms',
        multiplier: 1000
      },
      {
        from: 'ms',
        to: 's',
        multiplier: 0.001
      },
      {
        from: 's',
        to: 'hr',
        multiplier: 0.000277777778
      },
      {
        from: 'hr',
        to: 's',
        multiplier: 3600
      },
      {
        from: 'ms',
        to: 'hr',
        multiplier: 0.000000278
      },
      {
        from: 'hr',
        to: 'ms',
        multiplier: 3600000
      },
      {
        from: 'kcal',
        to: 'kJ',
        multiplier: 4.18400
      },
      {
        from: 'kJ',
        to: 'kcal',
        multiplier: 0.239005736
      },
    ];
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
    const fromUnitCode = this.getUnitCodeFromUnknownType(fromUnit)

    return this.convert(value, fromUnitCode, this.getToUnitCode(fromUnitCode));
  }

  getUnitCodeFromUnknownType(unit: any) {
    let unitCode = '';

    if (unit.abbreviation) {
      unitCode = unit.abbreviation;
    }
    else if (typeof unit === 'number' ||
      this.units.filter(x => x.abbreviation == unit).length == 0) {
      unitCode = this.getUnitCode(unit);
    }
    else {
      unitCode = unit;
    }

    return unitCode;
  }

  convert(value: number, fromUnit: any, toUnit: any) {
    let fromUnitCode = this.getUnitCodeFromUnknownType(fromUnit);

    let toUnitCode = this.getUnitCodeFromUnknownType(toUnit);

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

    const conversion = this.unitConversions.filter(x => x.from == fromUnitCode && x.to == toUnitCode)[0];

    if (conversion) {
      num = value * conversion.multiplier;
    }
    else {
      console.error('no conversion available ' + fromUnitCode + ' -> ' + toUnitCode);

      return value;
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

      this.convertSetDistanceValueToBiggerUnit(model);
    }
  }

  convertSetDistanceValueToBiggerUnit(model: { distance: number, distance_unit: number }) {
    if (model) {
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
