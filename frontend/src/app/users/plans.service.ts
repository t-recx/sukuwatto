import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { Observable, of } from 'rxjs';
import { Plan } from './plan';
import { tap, catchError, map } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
import { environment } from 'src/environments/environment';
import { ProgressionStrategy } from './plan-progression-strategy';

@Injectable({
  providedIn: 'root'
})
export class PlansService {
  private plansUrl= `${environment.apiUrl}/plans/`;
  private adoptPlanUrl= `${environment.apiUrl}/adopt-plan/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  getPlans (): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.plansUrl)
      .pipe(
        map(response => this.getProperlyTypedPlans(response)),
        catchError(this.errorService.handleError<Plan[]>('getPlans', (e: any) => 
        { 
          this.alertService.error('Unable to fetch plans');
        }, []))
      );
  }

  getPublicPlans (): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.plansUrl}?public=true`)
      .pipe(
        map(response => this.getProperlyTypedPlans(response)),
        catchError(this.errorService.handleError<Plan[]>('getAdoptedPlans', (e: any) => 
        { 
          this.alertService.error('Unable to fetch adopted plans');
        }, []))
      );
  }

  getAdoptedPlans (username: string): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.plansUrl}?owner__username=${username}`)
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
          this.alertService.error('Unable to fetch plan');
        }, new Plan()))
      );
  }

  getProperlyTypedPlans(plans: Plan[]): Plan[] {
    for (let plan of plans) {
      plan = this.getProperlyTypedPlan(plan);
    }

    return plans;
  }

  getProperlyTypedPlan(plan: Plan): Plan {
    if (plan.progressions) {
      plan.progressions = this.getProperlyTypedProgressions(plan.progressions);
    }

    if (plan.sessions) {
      for (let session of plan.sessions) {
        if (session.progressions) {
          session.progressions = this.getProperlyTypedProgressions(session.progressions);

          if (session.groups) {
            for (let group of session.groups) {
              group.progressions = this.getProperlyTypedProgressions(group.progressions);
            }
          }
        }
      }
    }

    return plan;
  }

  getProperlyTypedProgressions(progressions: ProgressionStrategy[]): ProgressionStrategy[] {
    for (let progression of progressions) {
      if (progression.weight_increase) {
        progression.weight_increase = Number(progression.weight_increase);
      }
      if (progression.percentage_increase) {
        progression.percentage_increase = Number(progression.percentage_increase);
      }
    }

    return progressions;
  }

  adoptPlan(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(`${this.adoptPlanUrl}${plan.id}/`, null)
    .pipe(
      tap((newPlan: Plan) => { }),
      catchError(this.errorService.handleError<Plan>('adoptPlan', (e: any) => 
      {
        this.alertService.error('Unable to adopt plan, try again later');
      }, plan))
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
      tap((newPlan: Plan) => { }),
      catchError(this.errorService.handleError<Plan>('createPlan', (e: any) => 
      {
        this.alertService.error('Unable to create plan, try again later');
      }, plan))
    );
  }

  updatePlan(plan: Plan): Observable<Plan> {
    return this.http.put<Plan>(`${this.plansUrl}${plan.id}/`, plan, this.httpOptions)
    .pipe(
      tap((newPlan: Plan) => { }),
      catchError(this.errorService.handleError<Plan>('updatePlan', (e: any) => 
      {
        this.alertService.error('Unable to update plan, try again later');
      }, plan))
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
}
