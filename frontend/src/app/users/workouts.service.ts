import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { Observable } from 'rxjs';
import { Workout } from './workout';
import { tap, catchError, map } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
import { environment } from 'src/environments/environment';
import { WorkoutSet } from './workout-set';
import { Paginated } from './paginated';

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

  getWorkouts (username: string, page: number, page_size: number): Observable<Paginated<Workout>> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('user__username', username);
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    if (username || page || page_size) {
      options = {params: params};
    }

    return this.http.get<Paginated<Workout>>(`${this.workoutsUrl}`, options)
      .pipe(
        map(response => {
          if (response.results) {
            response.results = this.getProperlyTypedWorkouts(response.results);
          }
          return response;
        }),
        catchError(this.errorService.handleError<Paginated<Workout>>('getWorkouts', (e: any) => 
        { 
          this.alertService.error('Unable to fetch workouts');
        }, new Paginated<Workout>()))
      );
  }

  getLastWorkout(username: string, plan: number, plan_session: number, date_lte: Date): Observable<Workout> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (plan) {
      params = params.set('plan', plan.toString());
    }

    if (plan_session) {
      params = params.set('plan_session', plan_session.toString());
    }

    if (date_lte) {
      params = params.set('date_lte', date_lte.toISOString());
    }

    if (username || plan_session || date_lte) {
      options = {params: params};
    }

    return this.http.get<Workout>(`${this.workoutLast}`, options)
      .pipe(
        map(response => {
          return this.getProperlyTypedWorkout(response);
        }),
        catchError(this.errorService.handleError<Workout>('getLastWorkout', (e: any) => 
        { 
          this.alertService.error('Unable to fetch last workout');
        }, new Workout()))
      );
  }
  
  getWorkout (id: number | string): Observable<Workout> {
    return this.http.get<Workout>(`${this.workoutsUrl}${id}/`)
      .pipe(
        map(response => {
          return this.getProperlyTypedWorkout(response);
        }),
        catchError(this.errorService.handleError<Workout>('getWorkout', (e: any) => 
        { 
          this.alertService.error('Unable to fetch workout');
        }, new Workout()))
      );
  }

  getProperlyTypedWorkouts(workouts: Workout[]): Workout[] {
    for(let workout of workouts) {
      workout = this.getProperlyTypedWorkout(workout);
    }

    return workouts;
  }

  getProperlyTypedWorkout(workout: Workout): Workout {
    if (workout.working_weights) {
      for (let ww of workout.working_weights) {
        if (ww.weight) {
          ww.weight = Number(ww.weight);
        }
        if (ww.previous_weight) {
          ww.previous_weight = Number(ww.previous_weight);
        }
      }
    }

    if (workout.groups) {
      for (let g of workout.groups) {
        if (g.warmups) {
          for (let wu of g.warmups) {
            if (wu.weight) {
              wu.weight = Number(wu.weight);
            }
            if (wu.working_weight_percentage) {
              wu.working_weight_percentage = Number(wu.working_weight_percentage);
            }
          }
        }

        if (g.sets) {
          for (let s of g.sets) {
            if (s.weight) {
              s.weight = Number(s.weight);
            }
            if (s.working_weight_percentage) {
              s.working_weight_percentage = Number(s.working_weight_percentage);
            }
          }
        }
      }
    }

    return workout;
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

