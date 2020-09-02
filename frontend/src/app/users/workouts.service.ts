import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { Observable, Subject } from 'rxjs';
import { Workout } from './workout';
import { tap, catchError, map } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
import { environment } from 'src/environments/environment';
import { Paginated } from './paginated';
import { WorkoutGroup } from './workout-group';
import { WorkoutSet } from './workout-set';
import { WorkoutSetPosition } from './workout-set-position';
import { latLng } from 'leaflet';
import { GeoTrackingType, GeoView } from './workout-set-geolocation/workout-set-geolocation.component';
import { WorkoutSetTimeSegment } from './workout-set-time-segment';
import { UserAvailableChartData } from './user-available-chart-data';

@Injectable({
  providedIn: 'root'
})
export class WorkoutsService {
  private workoutsUrl= `${environment.apiUrl}/workouts/`;
  private workoutVisibleUrl= `${environment.apiUrl}/workout-visible/`;
  private workoutEditableUrl= `${environment.apiUrl}/workout-editable/`;
  private workoutsByDateUrl= `${environment.apiUrl}/workouts-by-date/`;
  private workoutLast= `${environment.apiUrl}/workout-last/`;
  private workoutGroupLast= `${environment.apiUrl}/workout-group-last/`;
  private workoutLastWorkoutPosition = `${environment.apiUrl}/workout-last-position/`;
  private availableChartDataUrl= `${environment.apiUrl}/user-available-chart-data/`;

  geolocationActivitiesFinished = new Subject();

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  getAvailableChartData (username: string, date_gte: Date, date_lte: Date): Observable<UserAvailableChartData> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (date_lte) {
      params = params.set('date_lte', date_lte.toISOString());
    }

    if (date_gte) {
      params = params.set('date_gte', date_gte.toISOString());
    }

    if (username || date_gte || date_lte) {
      options = {params: params};
    }

    return this.http.get<UserAvailableChartData>(`${this.availableChartDataUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<UserAvailableChartData>('getUserAvailableChartDatas', (e: any) => 
        {
          this.alertService.error('Unable to fetch available chart data');
        }, null))
      );
  }

  getWorkoutsByDate (username: string, date_gte: Date, date_lte: Date): Observable<Workout[]> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (date_lte) {
      params = params.set('date_lte', date_lte.toISOString());
    }

    if (date_gte) {
      params = params.set('date_gte', date_gte.toISOString());
    }

    if (username || date_gte || date_lte) {
      options = {params: params};
    }

    return this.http.get<Workout[]>(`${this.workoutsByDateUrl}`, options)
      .pipe(
        map(response => {
          if (response) {
            response = this.getProperlyTypedWorkouts(response);
          }

          return response;
        }),
        catchError(this.errorService.handleError<Workout[]>('getWorkouts', (e: any) => 
        {
          this.alertService.error('Unable to fetch workouts');
        }, []))
      );
  }

  getWorkouts (username: string, page: number = null, page_size: number = null): Observable<Paginated<Workout>> {
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
        })
      );
  }

  getLastWorkoutPosition(username: string) {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (username) {
      options = {params: params};
    }

    return this.http.get<WorkoutSetPosition>(`${this.workoutLastWorkoutPosition}`, options)
      .pipe(
        map(response => {
          return this.getProperlyTypedWorkoutSetPosition(response);
        }),
        catchError(this.errorService.handleError<WorkoutSetPosition>('getLastWorkoutPosition', (e: any) => 
        { 
          this.alertService.error('Unable to fetch last workout position');
        }, new WorkoutSetPosition()))
      );
  }

  getLastWorkoutGroup(date_lte: Date, plan_session_group: number): Observable<WorkoutGroup> {
    let options = {};
    let params = new HttpParams();

    if (date_lte) {
      params = params.set('date_lte', date_lte.toISOString());
    }

    if (plan_session_group) {
      params = params.set('plan_session_group', plan_session_group.toString());
    }

    if (date_lte || plan_session_group) {
      options = {params: params};
    }

    return this.http.get<WorkoutGroup>(`${this.workoutGroupLast}`, options)
      .pipe(
        map(response => {
          return this.getProperlyTypedWorkoutGroup(response);
        }),
        catchError(this.errorService.handleError<WorkoutGroup>('getLastWorkoutGroup', (e: any) => 
        { 
          this.alertService.error('Unable to fetch last workout group');
        }, new WorkoutGroup()))
      );
  }

  getLastWorkout(plan: number, plan_session: number, date_lte: Date): Observable<Workout> {
    let options = {};
    let params = new HttpParams();

    if (plan) {
      params = params.set('plan', plan.toString());
    }

    if (plan_session) {
      params = params.set('plan_session', plan_session.toString());
    }

    if (date_lte) {
      params = params.set('date_lte', date_lte.toISOString());
    }

    if (plan || plan_session || date_lte) {
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
  
  workoutVisible (id: number): Observable<boolean> {
    let options = {};
    let params = new HttpParams();

    params = params.set('id', id.toString());
    options = {params: params};

    return this.http.get<boolean>(`${this.workoutVisibleUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<boolean>('workoutvisible', (e: any) => 
        {}, false))
      );
  }
  
  workoutEditable (id: number): Observable<boolean> {
    let options = {};
    let params = new HttpParams();

    params = params.set('id', id.toString());
    options = {params: params};

    return this.http.get<boolean>(`${this.workoutEditableUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<boolean>('workoutvisible', (e: any) => 
        {}, false))
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
          if (e && e.status && e.status != 404) {
            this.alertService.error('Unable to fetch workout');
          }
        }, null))
      );
  }

  getProperlyTypedWorkouts(workouts: Workout[]): Workout[] {
    for(let workout of workouts) {
      workout = this.getProperlyTypedWorkout(workout);
    }

    return workouts;
  }

  getProperlyTypedWorkoutSetTimeSegment(segment: WorkoutSetTimeSegment): WorkoutSetTimeSegment {
    if (segment) {
      if (segment.start) {
        segment.start = new Date(segment.start);
      }

      if (segment.end) {
        segment.end = new Date(segment.end);
      }
    }

    return segment;
  }

  getProperlyTypedWorkoutSetPosition(position: WorkoutSetPosition): WorkoutSetPosition {
    if (position) {
      if (position.altitude) {
        position.altitude = Number(position.altitude);
      }
      if (position.latitude) {
        position.latitude = Number(position.latitude);
      }
      if (position.longitude) {
        position.longitude = Number(position.longitude);
      }
    }

    return position;
  }

  getProperlyTypedWorkout(workout: Workout): Workout {
    if (workout) {
      if (workout.start) {
        workout.start = new Date(workout.start);
      }

      if (workout.end) {
        workout.end = new Date(workout.end);
      }

      if (workout.working_parameters) {
        for (let ww of workout.working_parameters) {
          if (ww.parameter_value) {
            ww.parameter_value = Number(ww.parameter_value);
          }
          if (ww.previous_parameter_value) {
            ww.previous_parameter_value = Number(ww.previous_parameter_value);
          }
        }
      }

      if (workout.groups) {
        for (let g of workout.groups) {
          g = this.getProperlyTypedWorkoutGroup(g);
        }
      }
    }

    return workout;
  }

  getProperlyTypedWorkoutGroup(g: WorkoutGroup): WorkoutGroup {
    g.warmups = this.getProperlyTypedWorkoutActivities(g.warmups);
    g.sets = this.getProperlyTypedWorkoutActivities(g.sets);

    return g;
  }

  getProperlyTypedWorkoutActivities(g: WorkoutSet[]): WorkoutSet[] {
    if (g) {
      g.forEach(activity => {
        activity.calories = activity.calories ? +activity.calories : activity.calories;
        activity.speed = activity.speed ? +activity.speed : activity.speed;
        activity.distance = activity.distance ? +activity.distance : activity.distance;
        activity.time = activity.time ? +activity.time : activity.time;
        activity.vo2max = activity.vo2max ? +activity.vo2max : activity.vo2max;
        activity.weight = activity.weight ? +activity.weight : activity.weight;

        activity.working_weight_percentage = activity.working_weight_percentage ? +activity.working_weight_percentage : activity.working_weight_percentage;
        activity.working_speed_percentage = activity.working_speed_percentage ? +activity.working_speed_percentage : activity.working_speed_percentage;
        activity.working_time_percentage = activity.working_time_percentage ? +activity.working_time_percentage : activity.working_time_percentage;
        activity.working_distance_percentage = activity.working_distance_percentage ? +activity.working_distance_percentage : activity.working_distance_percentage;

        activity.zoom = activity.zoom ? +activity.zoom : activity.zoom;
        activity.center = activity.center ? latLng(activity.center) : activity.center;
        activity.watchId = activity.watchId ? +activity.watchId : activity.watchId;

        activity.start = activity.start ? new Date(activity.start) : activity.start;
        activity.end = activity.end ? new Date(activity.end) : activity.end;

        if (activity.positions) {
          activity.positions.forEach(p => {
            p = this.getProperlyTypedWorkoutSetPosition(p);
          });
        }

        if (activity.segments) {
          activity.segments.forEach(p => p = this.getProperlyTypedWorkoutSetTimeSegment(p));
        }
      });
    }

    return g;
  }

  saveWorkout(workout: Workout): Observable<Workout> {
    if (workout.id && workout.id > 0)
      return this.updateWorkout(workout);

    return this.createWorkout(workout);
  }

  createWorkout(workout: Workout): Observable<Workout> {
    return this.http.post<Workout>(this.workoutsUrl, workout, this.httpOptions)
    .pipe(
      map(response => {
        return this.getProperlyTypedWorkout(response);
      }),
      catchError(this.errorService.handleError<Workout>('createWorkout', (e: any) => 
      {
        this.alertService.error('Unable to create workout, try again later');
      }, null))
    );
  }

  updateWorkout(workout: Workout): Observable<Workout> {
    return this.http.put<Workout>(`${this.workoutsUrl}${workout.id}/`, workout, this.httpOptions)
    .pipe(
      map(response => {
        return this.getProperlyTypedWorkout(response);
      }),
      catchError(this.errorService.handleError<Workout>('updateWorkout', (e: any) => 
      {
        this.alertService.error('Unable to update workout, try again later');
      }, null))
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

  finishGeolocationActivity() {
    this.geolocationActivitiesFinished.next();
  }
}

