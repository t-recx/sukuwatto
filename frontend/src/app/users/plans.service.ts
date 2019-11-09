import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { Observable } from 'rxjs';
import { Plan } from './plan';
import { tap, catchError } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlansService {
  private plansUrl= `${environment.apiUrl}/plans/`;

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
        catchError(this.errorService.handleError<Plan[]>('getPlans', (e: any) => 
        { 
          this.alertService.error('Unable to fetch plans');
        }, []))
      );
  }
  
  getPlan (id: number | string): Observable<Plan> {
    return this.http.get<Plan>(`${this.plansUrl}${id}/`)
      .pipe(
        catchError(this.errorService.handleError<Plan>('getPlan', (e: any) => 
        { 
          this.alertService.error('Unable to fetch plan');
        }, new Plan()))
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
