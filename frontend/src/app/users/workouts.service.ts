import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { Observable } from 'rxjs';
import { Workout } from './workout';
import { tap, catchError } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
import { environment } from 'src/environments/environment';
import { WorkoutSet } from './workout-set';

@Injectable({
  providedIn: 'root'
})
export class WorkoutsService {
  private workoutsUrl= `${environment.apiUrl}/workouts/`;
  private workoutLast= `${environment.apiUrl}/workout-last/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  getWorkouts (username: string): Observable<Workout[]> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params.set('user__username', username);
      options = {params: params};
    }

    return this.http.get<Workout[]>(`${this.workoutsUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<Workout[]>('getWorkouts', (e: any) => 
        { 
          this.alertService.error('Unable to fetch workouts');
        }, []))
      );
  }

  getLastWorkout(username: string, plan_session: number, date_lte: Date): Observable<Workout> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params.set('username', username);
    }

    if (plan_session) {
      params.set('plan_session', plan_session.toString());
    }

    if (date_lte) {
      params.set('date_lte', date_lte.toISOString());
    }

    if (username || plan_session || date_lte) {
      options = {params: params};
    }

    return this.http.get<Workout>(`${this.workoutLast}`, options)
      .pipe(
        catchError(this.errorService.handleError<Workout>('getLastWorkout', (e: any) => 
        { 
          this.alertService.error('Unable to fetch last workout');
        }, new Workout()))
      );
  }
  
  getWorkout (id: number | string): Observable<Workout> {
    return this.http.get<Workout>(`${this.workoutsUrl}${id}/`)
      .pipe(
        catchError(this.errorService.handleError<Workout>('getWorkout', (e: any) => 
        { 
          this.alertService.error('Unable to fetch workout');
        }, new Workout()))
      );
  }

  saveWorkout(workout: Workout): Observable<Workout> {
    if (workout.id && workout.id > 0)
      return this.updateWorkout(workout);

    return this.createWorkout(workout);
  }

  createWorkout(workout: Workout): Observable<Workout> {
    return this.http.post<Workout>(this.workoutsUrl, workout, this.httpOptions)
    .pipe(
      tap((newWorkout: Workout) => { }),
      catchError(this.errorService.handleError<Workout>('createWorkout', (e: any) => 
      {
        this.alertService.error('Unable to create workout, try again later');
      }, workout))
    );
  }

  updateWorkout(workout: Workout): Observable<Workout> {
    return this.http.put<Workout>(`${this.workoutsUrl}${workout.id}/`, workout, this.httpOptions)
    .pipe(
      tap((newWorkout: Workout) => { }),
      catchError(this.errorService.handleError<Workout>('updateWorkout', (e: any) => 
      {
        this.alertService.error('Unable to update workout, try again later');
      }, workout))
    );
  }

  deleteWorkout(workout: Workout): Observable<Workout> {
    const id = typeof workout === 'number' ? workout : workout.id;
    const url = `${this.workoutsUrl}${id}/`;

    return this.http.delete<Workout>(url, this.httpOptions).pipe(
      catchError(this.errorService.handleError<Workout>('deleteWorkout', (e: any) => 
      {
        this.alertService.error('Unable to delete workout, try again later');
      }, new Workout()))
    );
  }
}

