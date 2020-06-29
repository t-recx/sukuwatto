import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpParams, HttpClient } from '@angular/common/http';
import { MetabolicEquivalentTask } from './metabolic-equivalent-task';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetabolicEquivalentService {
  private mets= `${environment.apiUrl}/mets/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService) { }

  getMets (exercise: number): Observable<MetabolicEquivalentTask[]> {
    let options = {};
    let params = new HttpParams();

    if (exercise) {
      params = params.set('exercise', exercise.toString());
    }

    if (exercise) {
      options = {params: params};
    }

    return this.http.get<MetabolicEquivalentTask[]>(this.mets, options)
      .pipe(
        map(response => this.getProperlyTypedMets(exercise, response)),
        catchError(this.errorService.handleError<MetabolicEquivalentTask[]>('getMets', (e: any) => 
        { 
          this.alertService.error('Unable to fetch metabolic equivalent tasks');
        }, []))
      );
  }

  getProperlyTypedMets(exercise: number, mets: MetabolicEquivalentTask[]) {
    if (mets) {
      mets.forEach(met => {
        met.exercise = exercise;
        met.met = met.met ? +met.met : met.met;
        met.from_value = met.from_value ? +met.from_value : met.from_value;
        met.to_value = met.to_value ? +met.to_value : met.to_value;
        met.unit = met.unit ? +met.unit : met.unit;
      });
    }

    return mets;
  }
}
