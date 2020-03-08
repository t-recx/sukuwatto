import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ErrorService } from '../error.service';
import { Observable } from 'rxjs';
import { Unit } from './unit';
import { catchError, shareReplay } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
import { HttpClient } from '@angular/common/http';

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
  ) { }

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
}