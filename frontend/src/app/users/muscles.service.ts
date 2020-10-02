import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AlertService } from '../alert/alert.service';
import { ErrorService } from '../error.service';
import { Muscle } from './muscle';
import { Paginated } from './paginated';
import { Workout } from './workout';

@Injectable({
  providedIn: 'root'
})
export class MusclesService {
  private musclesUrl= `${environment.apiUrl}/muscles/`;

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService) { }

  getMuscles (): Observable<Muscle[]> {
    let options = {};

    return this.http.get<Muscle[]>(`${this.musclesUrl}`, options)
    .pipe(
        catchError(this.errorService.handleError<Muscle[]>('getMuscles', (e: any) => 
        {
          this.alertService.error('Unable to fetch muscles');
        }, []))
    );
  }
}
