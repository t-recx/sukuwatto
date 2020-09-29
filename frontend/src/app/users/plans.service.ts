import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { Observable, of } from 'rxjs';
import { Plan } from './plan';
import { tap, catchError, map } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
import { environment } from 'src/environments/environment';
import { ProgressionStrategy, ProgressionType } from './plan-progression-strategy';
import { PlanSession } from './plan-session';
import { PlanSessionGroup } from './plan-session-group';
import { PlanSessionGroupActivity, RepetitionType, SpeedType, DistanceType, TimeType } from './plan-session-group-activity';
import { Result, Results } from '../result';
import { ExerciseType } from './exercise';
import { Paginated } from './paginated';

@Injectable({
  providedIn: 'root'
})
export class PlansService {
  private plansUrl= `${environment.apiUrl}/plans/`;
  private adoptedPlansUrl= `${environment.apiUrl}/adopted-plans/`;
  private ownedPlansPaginatedUrl= `${environment.apiUrl}/owned-plans-paginated/`;
  private isAdoptedUrl= `${environment.apiUrl}/plan-adopted/`;
  private plansPaginatedUrl= `${environment.apiUrl}/plans-paginated/`;
  private adoptedPlansPaginatedUrl= `${environment.apiUrl}/adopted-plans-paginated/`;
  private adoptPlanUrl= `${environment.apiUrl}/adopt-plan/`;
  private leavePlanUrl= `${environment.apiUrl}/leave-plan/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  public isAdopted(plan_id: number, user_id: number): Observable<boolean> {
    let options = {};
    let params = new HttpParams();

    params = params.set('plan_id', plan_id.toString());
    params = params.set('user_id', user_id.toString());

    options = {params: params};

    return this.http.get<boolean>(this.isAdoptedUrl, options)
      .pipe(
        catchError(this.errorService.handleError<boolean>('isAdopted', (e: any) => 
        { 
          this.alertService.error('Unable to fetch is adopted');
        }, false))
      );
    
  }

  getPublicPlans (username: string, page: number, page_size: number, search_filter: string): Observable<Paginated<Plan>> {
    let options = {};
    let params = new HttpParams();

    params = params.set('public', 'true');

    if (username) {
      params = params.set('user__username', username);
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (search_filter) {
      params = params.set('search', search_filter);
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    options = {params: params};

    return this.http.get<Paginated<Plan>>(`${this.plansPaginatedUrl}`, options)
      .pipe(
        map(response => {
          if (response.results) {
            response.results = this.getProperlyTypedPlans(response.results);
          }
          return response; })
      );
  }

  getOwnedPlansPaginated (username: string, page: number, page_size: number, search_filter: string): Observable<Paginated<Plan>> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (search_filter) {
      params = params.set('search', search_filter);
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    options = {params: params};

    return this.http.get<Paginated<Plan>>(`${this.ownedPlansPaginatedUrl}`, options)
      .pipe(
        map(response => {
          if (response.results) {
            response.results = this.getProperlyTypedPlans(response.results);
          }
          return response; })
      );
  }

  getAdoptedPlansPaginated (username: string, page: number, page_size: number, search_filter: string): Observable<Paginated<Plan>> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (search_filter) {
      params = params.set('search', search_filter);
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    options = {params: params};

    return this.http.get<Paginated<Plan>>(`${this.adoptedPlansPaginatedUrl}`, options)
      .pipe(
        map(response => {
          if (response.results) {
            response.results = this.getProperlyTypedPlans(response.results);
          }
          return response; })
      );
  }

  getAdoptedPlans (username: string): Observable<Plan[]> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    options = {params: params};

    return this.http.get<Plan[]>(`${this.adoptedPlansUrl}`, options)
      .pipe(
        map(response => this.getProperlyTypedPlans(response)),
        catchError(this.errorService.handleError<Plan[]>('getAdoptedPlans', (e: any) => 
        { 
          this.alertService.error('Unable to fetch adopted plans');
        }, []))
      );
  }
  
  getPlan (id: number | string): Observable<Plan> {
    return this.http.get<Plan>(`${this.plansUrl}${id}/`)
      .pipe(
        map(response => this.getProperlyTypedPlan(response)),
        catchError(this.errorService.handleError<Plan>('getPlan', (e: any) => 
        { 
          if (e && e.status && e.status != 404) { 
            this.alertService.error('Unable to fetch plan');
          }
        }, null))
      );
  }

  getProperlyTypedPlans(plans: Plan[]): Plan[] {
    if (plans) {
      for (let plan of plans) {
        plan = this.getProperlyTypedPlan(plan);
      }
    }

    return plans;
  }

  getProperlyTypedPlan(plan: Plan): Plan {
    if (plan) {
      plan.creation = new Date(plan.creation);

      if (plan.progressions) {
        plan.progressions = this.getProperlyTypedProgressions(plan.progressions);
      }

      if (plan.sessions) {
        plan.sessions = this.getProperlyTypedPlanSessions(plan.sessions);
      }
    }

    return plan;
  }

  getProperlyTypedPlanSessions(sessions: PlanSession[]): PlanSession[] {
    if (sessions) {
      for (let session of sessions) {
        if (session.progressions) {
          session.progressions = this.getProperlyTypedProgressions(session.progressions);

          if (session.groups) {
            for (let group of session.groups) {
              group.progressions = this.getProperlyTypedProgressions(group.progressions);
              group.exercises = this.getProperlyTypedActivities(group.exercises);
              group.warmups = this.getProperlyTypedActivities(group.warmups);
            }
          }
        }
      }
    }

    return sessions;
  }

  getProperlyTypedActivities(activities: PlanSessionGroupActivity[]): PlanSessionGroupActivity[] {
    if (activities) {
      activities.forEach(activity => {
        activity.speed = activity.speed ? +activity.speed : activity.speed;
        activity.speed_up_to = activity.speed_up_to ? +activity.speed_up_to : activity.speed_up_to;
        activity.time = activity.time ? +activity.time : activity.time;
        activity.time_up_to = activity.time_up_to ? +activity.time_up_to : activity.time_up_to;
        activity.distance = activity.distance ? +activity.distance : activity.distance;
        activity.distance_up_to = activity.distance_up_to ? +activity.distance_up_to : activity.distance_up_to;
        activity.vo2max = activity.vo2max ? +activity.vo2max : activity.vo2max;
        activity.vo2max_up_to = activity.vo2max_up_to ? +activity.vo2max_up_to : activity.vo2max_up_to;
        activity.working_weight_percentage = activity.working_weight_percentage ? +activity.working_weight_percentage : activity.working_weight_percentage;
        activity.working_distance_percentage = activity.working_distance_percentage ? +activity.working_distance_percentage : activity.working_distance_percentage;
        activity.working_time_percentage = activity.working_time_percentage ? +activity.working_time_percentage : activity.working_time_percentage;
        activity.working_speed_percentage = activity.working_speed_percentage ? +activity.working_speed_percentage : activity.working_speed_percentage;
      });
    }

    return activities;
  }

  getProperlyTypedProgressions(progressions: ProgressionStrategy[]): ProgressionStrategy[] {
    for (let progression of progressions) {
      if (progression.parameter_increase) {
        progression.parameter_increase = Number(progression.parameter_increase);
      }
      if (progression.percentage_increase) {
        progression.percentage_increase = Number(progression.percentage_increase);
      }
      if (progression.initial_value) {
        progression.initial_value = Number(progression.initial_value);
      }
    }

    return progressions;
  }

  adoptPlan(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(`${this.adoptPlanUrl}${plan.id}/`, null)
    .pipe(
      map(response => this.getProperlyTypedPlan(response)),
      catchError(this.errorService.handleError<Plan>('adoptPlan', (e: any) => 
      {
        this.alertService.error('Unable to adopt plan, try again later');
      }, plan))
    );
  }

  leavePlan(plan: Plan): Observable<Plan> {
    return this.http.post<any>(`${this.leavePlanUrl}${plan.id}/`, null)
    .pipe(
      map(response => this.getProperlyTypedPlan(response)),
      catchError(this.errorService.handleError<any>('leavePlan', (e: any) => 
      {
        this.alertService.error('Unable to leave plan, try again later');
      }, null))
    );
  }

  savePlan(plan: Plan): Observable<Plan> {
    if (plan.id && plan.id > 0)
      return this.updatePlan(plan);

    return this.createPlan(plan);
  }

  createPlan(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(this.plansUrl, plan, this.httpOptions)
    .pipe(
      map(response => this.getProperlyTypedPlan(response)),
      catchError(this.errorService.handleError<Plan>('createPlan', (e: any) => 
      {
        this.alertService.error('Unable to create plan, try again later');
      }, null))
    );
  }

  updatePlan(plan: Plan): Observable<Plan> {
    return this.http.put<Plan>(`${this.plansUrl}${plan.id}/`, plan, this.httpOptions)
    .pipe(
      map(response => this.getProperlyTypedPlan(response)),
      catchError(this.errorService.handleError<Plan>('updatePlan', (e: any) => 
      {
        this.alertService.error('Unable to update plan, try again later');
      }, null))
    );
  }

  deletePlan(plan: Plan): Observable<Plan> {
    const id = typeof plan === 'number' ? plan : plan.id;
    const url = `${this.plansUrl}${id}/`;

    return this.http.delete<Plan>(url, this.httpOptions).pipe(
      catchError(this.errorService.handleError<Plan>('deletePlan', (e: any) => 
      {
        this.alertService.error('Unable to delete plan, try again later');
      }, new Plan()))
    );
  }

  valid(plan: Plan): boolean {
    if (!plan.short_name || 0 == plan.short_name.trim().length) {
      return false;
    }

    if (!plan.name || 0 == plan.name.trim().length) {
      return false;
    }

    for (const session of plan.sessions) {
      if (!this.validSession(session)) {
        return false;
      }
    }

    for (const progression of plan.progressions) {
      if (this.validateProgression(progression).failed()) {
        return false;
      }
    }

    return true;
  }

  validSession(session: PlanSession): boolean {
    if (!session.name || 0 == session.name.trim().length) {
      return false;
    }

    for (const group of session.groups) {
      if (!this.validGroup(group)) {
        return false;
      }
    }

    for (const progression of session.progressions) {
      if (this.validateProgression(progression).failed()) {
        return false;
      }
    }

    return true;
  }

  validGroup(group: PlanSessionGroup): boolean {
    if (!group.order) {
      return false;
    }

    if (!group.name || 0 == group.name.trim().length) {
      return false;
    }

    for (const exercise of group.exercises) {
      if (!this.validActivity(exercise)) {
        return false;
      }
    }

    for (const warmup of group.warmups) {
      if (!this.validActivity(warmup)) {
        return false;
      }
    }

    for (const progression of group.progressions) {
      if (this.validateProgression(progression).failed()) {
        return false;
      }
    }

    return true;
  }

  validActivity(activity: PlanSessionGroupActivity): boolean {
    if (!activity.order) {
      return false;
    }

    if (!activity.exercise) {
      return false;
    }

    if (!activity.number_of_sets || activity.number_of_sets <= 0) {
      return false;
    }

    if (activity.exercise.exercise_type == ExerciseType.Strength) {
      if (!activity.repetition_type) {
        return false;
      }
      if ((activity.repetition_type == RepetitionType.Standard || 
        activity.repetition_type == RepetitionType.Range) &&
        !activity.number_of_repetitions) {
        return false;
      }

      if (activity.repetition_type == RepetitionType.Range &&
        !activity.number_of_repetitions_up_to) {
        return false;
      }

      if (activity.working_weight_percentage == null) {
        return false;
      }
    }
    else if (activity.exercise.exercise_type == ExerciseType.Cardio) {
      if (activity.speed_type) {
        if ((activity.speed_type == SpeedType.Standard ||
          activity.speed_type == SpeedType.Range) &&
          !activity.speed) {
          return false;
        }

        if (activity.speed_type == SpeedType.Range &&
          !activity.speed_up_to) {
          return false;
        }

        if (activity.speed_type == SpeedType.Parameter &&
          !activity.working_speed_percentage) {
          return false;
        }
      }

      if (activity.distance_type) {
        if ((activity.distance_type == DistanceType.Standard ||
          activity.distance_type == DistanceType.Range) &&
          !activity.distance) {
          return false;
        }

        if (activity.distance_type == DistanceType.Range &&
          !activity.distance_up_to) {
          return false;
        }

        if (activity.distance_type == DistanceType.Parameter &&
          !activity.working_distance_percentage) {
          return false;
        }
      }

      if (activity.time_type) {
        if ((activity.time_type == TimeType.Standard ||
          activity.time_type == TimeType.Range) &&
          !activity.time) {
          return false;
        }

        if (activity.time_type == TimeType.Range &&
          !activity.time_up_to) {
          return false;
        }

        if (activity.time_type == TimeType.Parameter &&
          !activity.working_time_percentage) {
          return false;
        }
      }
    }

    return true;
  }

  validateProgression(progression: ProgressionStrategy): Results<ProgressionStrategy> {
    const results = new Results<ProgressionStrategy>();
    
    if (!progression.progression_type) {
      results.push(new Result<ProgressionStrategy>({
        success: false,
        field: 'progression_type',
        object: progression,
        code: 'VPS1',
        message: 'Select a progression type',
      }));
    }

    if (progression.progression_type == ProgressionType.ByExercise) {
      if (!progression.exercise) {
        results.push(new Result<ProgressionStrategy>({
          success: false,
          field: 'exercise',
          object: progression,
          code: 'VPS2',
          message: 'Select an exercise',
        }));
      }
    } else if (progression.progression_type == ProgressionType.ByCharacteristics) {
      if (!progression.mechanics &&
        !progression.force &&
        !progression.modality &&
        !progression.section) {
          results.push(new Result<ProgressionStrategy>({
            success: false,
            field: 'parameters',
            object: progression,
            code: 'VPS3',
            message: 'Select one or more parameters',
          }));
        }
    }

    if (!progression.parameter_increase && !progression.percentage_increase) {
      results.push(new Result<ProgressionStrategy>({
        success: false,
        field: 'method',
        object: progression,
        code: 'VPS4',
        message: 'Select increase method',
      }));
    }

    if (progression.parameter_increase)  {
      if (!progression.unit) {
        results.push(new Result<ProgressionStrategy>({
          success: false,
          field: 'unit',
          object: progression,
          code: 'VPS5',
          message: 'Select unit',
        }));
      }
    }

    if (!progression.parameter_type) {
      results.push(new Result<ProgressionStrategy>({
        success: false,
        field: 'parameter_type',
        object: progression,
        code: 'VPS6',
        message: 'Select parameter type',
      }));
    }

    if (progression.initial_value)  {
      if (!progression.unit) {
        results.push(new Result<ProgressionStrategy>({
          success: false,
          field: 'unit',
          object: progression,
          code: 'VPS7',
          message: 'Select unit',
        }));
      }
    }

    progression.validations = results.getFailedFields();

    return results;
  }
}
