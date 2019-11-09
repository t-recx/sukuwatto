import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ErrorService } from '../error.service';
import { Observable } from 'rxjs';
import { Unit } from './unit';
import { catchError } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UnitConversionsService {
  private unitConversionsUrl= `${environment.apiUrl}/unitconversions/`;

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService,
  ) { }

  getUnitConversions (): Observable<Unit[]> {
    return this.http.get<Unit[]>(this.unitConversionsUrl)
      .pipe(
        catchError(this.errorService.handleError<Unit[]>('getUnitConversions', (e: any) => 
        { 
          this.alertService.error('Unable to fetch unit conversions');
        }, []))
      );
  }
}
