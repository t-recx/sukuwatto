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
        }
      }
    }

    return toUnitCode;
  }

  convert(value:any, fromUnit:Unit|string) {
    let fromUnitCode = '';

    if (fromUnit instanceof Unit) {
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

  roundValue(num: number, fromUnitCode: string, toUnitCode: string): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  convertWorkout(workout: Workout) {
    if (!workout) {
      return;
    }
    if (workout.groups) {
      workout.groups.forEach(group => {
        if (group.sets) {
          group.sets.forEach(s => this.convertWeightValue(s));
        }
        if (group.warmups) {
          group.warmups.forEach(s => this.convertWeightValue(s));
        }
      });
    }
    if (workout.working_weights) {
      workout.working_weights.forEach(ww => { 
        this.convertWeightValue(ww); 
        ww.previous_weight = this.convert(ww.previous_weight, ww.previous_unit_code);
        ww.previous_unit_code = this.getToUnitCode(ww.previous_unit_code);
      });
    }
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
        userBioData.weight = this.convert(userBioData.weight, userBioData.weight_unit_code);
        userBioData.weight_unit_code = this.getToUnitCode(userBioData.weight_unit_code);
      }

      if (userBioData.height && userBioData.height_unit_code) {
        userBioData.height = this.convert(userBioData.height, userBioData.height_unit_code);
        userBioData.height_unit_code = this.getToUnitCode(userBioData.height_unit_code);
      }

      if (userBioData.bone_mass_weight && userBioData.bone_mass_weight_unit_code) {
        userBioData.bone_mass_weight = this.convert(userBioData.bone_mass_weight, userBioData.bone_mass_weight_unit_code);
        userBioData.bone_mass_weight_unit_code = this.getToUnitCode(userBioData.bone_mass_weight_unit_code);
      }
    }
  }

  convertWeightValue(model: {weight: number, unit_code: string}) {
    if (model) {
      model.weight = this.convert(model.weight, model.unit_code);
      model.unit_code = this.getToUnitCode(model.unit_code);
    }
  }
}