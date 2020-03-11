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
      return uz(value + fromUnitCode).convert(toUnitCode).value;
    }

    return value;
  }
}