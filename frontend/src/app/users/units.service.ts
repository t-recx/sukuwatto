import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ErrorService } from '../error.service';
import { Observable } from 'rxjs';
import { Unit } from './unit';
import { catchError, shareReplay } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
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
  private unitsUrl= `${environment.apiUrl}/units/`;
  private cache$: Observable<Unit[]>;

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService,
    private authService: AuthService,
  ) { 
    Classes.addDefaults();
  }

  getUnits (): Observable<Unit[]> {
    if (!this.cache$) {
      this.cache$ =
        this.requestUnits().pipe(
          shareReplay({ bufferSize: 1, refCount: true }),
          catchError(this.errorService.handleError<Unit[]>('getUnits', (e: any) => 
          { 
            this.alertService.error('Unable to fetch units');
          }, []))
        );
    }

    return this.cache$;
  }

  requestUnits(): Observable<Unit[]> {
    return this.http.get<Unit[]>(this.unitsUrl);
  }

  getUserWeightUnitCode(): string {
      if (this.authService.getUserUnitSystem() == MeasurementSystem.Imperial) {
          return 'lb';
      }

      return 'kg';
  }

  getToUnitCode(fromUnit: string) {
    let toUnitCode = fromUnit;

    if (this.authService.isLoggedIn()) {
      if (this.authService.getUserUnitSystem() == MeasurementSystem.Imperial) {
        switch(fromUnit) {
          case 'kg':
            toUnitCode = 'lb';
            break;
          case 'cm':
            toUnitCode = 'ft';
            break;
          case 'km':
            toUnitCode = 'mi';
            break;
          case 'm':
            toUnitCode = 'yd';
            break;
        }
      }
      else if (this.authService.getUserUnitSystem() == MeasurementSystem.Metric) {
        switch(fromUnit) {
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
        }
      }
    }

    return toUnitCode;
  }

  convertToUserUnit(value:any, fromUnit:any) {
    let fromUnitCode = '';

    if (fromUnit.abbreviation) {
      fromUnitCode = fromUnit.abbreviation;
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

  convert(value:any, fromUnit:any, toUnit:any) {
    let fromUnitCode = '';

    if (fromUnit.abbreviation) {
      fromUnitCode = fromUnit.abbreviation;
    }
    else {
      fromUnitCode = fromUnit;
    }

    let toUnitCode = '';

    if (toUnit.abbreviation) {
      toUnitCode = toUnit.abbreviation;
    }
    else {
      toUnitCode = toUnit;
    }

    if (toUnitCode != fromUnitCode) {
      let num = uz(value + fromUnitCode).convert(toUnitCode).value;

      return this.roundValue(num, fromUnitCode, toUnitCode);
    }

    return value;
  }

  roundValue(num: number, fromUnitCode: string, toUnitCode: string): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
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
            ww.previous_parameter_value = this.convertToUserUnit(ww.previous_parameter_value, ww.previous_unit_code);
          }
          if (ww.previous_unit_code) {
            ww.previous_unit_code = this.getToUnitCode(ww.previous_unit_code);
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
      if (userBioData.weight && userBioData.weight_unit_code) {
        userBioData.weight = this.convertToUserUnit(userBioData.weight, userBioData.weight_unit_code);
        userBioData.weight_unit_code = this.getToUnitCode(userBioData.weight_unit_code);
      }

      if (userBioData.height && userBioData.height_unit_code) {
        userBioData.height = this.convertToUserUnit(userBioData.height, userBioData.height_unit_code);
        userBioData.height_unit_code = this.getToUnitCode(userBioData.height_unit_code);
      }

      if (userBioData.bone_mass_weight && userBioData.bone_mass_weight_unit_code) {
        userBioData.bone_mass_weight = this.convertToUserUnit(userBioData.bone_mass_weight, userBioData.bone_mass_weight_unit_code);
        userBioData.bone_mass_weight_unit_code = this.getToUnitCode(userBioData.bone_mass_weight_unit_code);
      }
    }
  }

  convertWeightValue(model: { weight: number, unit_code: string }) {
      if (model) {
          if (model.weight) {
              model.weight = this.convertToUserUnit(model.weight, model.unit_code);
          }
          if (model.unit_code) {
              model.unit_code = this.getToUnitCode(model.unit_code);
          }
      }
  }

  convertDistanceValue(model: { distance: number, expected_distance: number, expected_distance_up_to: number, distance_unit_code: string }) {
      if (model) {
          if (model.distance) {
              model.distance = this.convertToUserUnit(model.distance, model.distance_unit_code);
          }
          if (model.expected_distance) {
              model.expected_distance = this.convertToUserUnit(model.expected_distance, model.distance_unit_code);
          }
          if (model.expected_distance_up_to) {
              model.expected_distance_up_to = this.convertToUserUnit(model.expected_distance_up_to, model.distance_unit_code);
          }

          if (model.distance_unit_code) {
              model.distance_unit_code = this.getToUnitCode(model.distance_unit_code);
          }
      }
  }

  convertSpeedValue(model: { speed: number, expected_speed: number, expected_speed_up_to: number, speed_unit_code: string }) {
      if (model) {
          if (model.speed) {
              model.speed = this.convertToUserUnit(model.speed, model.speed_unit_code);
          }
          if (model.expected_speed) {
              model.expected_speed = this.convertToUserUnit(model.expected_speed, model.speed_unit_code);
          }
          if (model.expected_speed_up_to) {
              model.expected_speed_up_to = this.convertToUserUnit(model.expected_speed_up_to, model.speed_unit_code);
          }

          if (model.speed_unit_code) {
              model.speed_unit_code = this.getToUnitCode(model.speed_unit_code);
          }
      }
  }

  convertParameterValue(model: { parameter_value: number, unit_code: string }) {
      if (model) {
          if (model.parameter_value) {
              model.parameter_value = this.convertToUserUnit(model.parameter_value, model.unit_code);
          }
          if (model.unit_code) {
              model.unit_code = this.getToUnitCode(model.unit_code);
          }
      }
  }
}
