import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { Observable } from 'rxjs';
import { Paginated } from './paginated';
import { catchError, map } from 'rxjs/operators';
import { Action } from './action';

@Injectable({
  providedIn: 'root'
})
export class StreamsService {
  private actionsUrl= `${environment.apiUrl}/user-stream/`;
  private actionsObjectsUrl = `${environment.apiUrl}/action-object-stream/`;
  private targetUrl = `${environment.apiUrl}/target-stream/`;
  private toggleLikeUrl= `${environment.apiUrl}/toggle-like/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  getUserStream(page: number, page_size: number): Observable<Paginated<Action>> {
    let options = {};
    let params = new HttpParams();

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    if (page || page_size) {
      options = {params: params};
    }

    return this.http.get<Paginated<Action>>(`${this.actionsUrl}`, options)
      .pipe(
        map(response => {
          if (response.results) {
            response.results = this.getProperlyTypedActions(response.results);
          }
          return response;
        }),
        catchError(this.errorService.handleError<Paginated<Action>>('getUserStream', (e: any) => 
        { 
          this.alertService.error('Unable to fetch user stream');
        }, new Paginated<Action>()))
      );
  }

  getActionObjectStream(content_type_id: number | string, object_id: number | string): Observable<Action[]> {
    return this.getStream(this.actionsObjectsUrl, content_type_id, object_id);
  }

  getTargetStream(content_type_id: number | string, object_id: number | string): Observable<Action[]> {
    return this.getStream(this.targetUrl, content_type_id, object_id);
  }

  private getStream(url: string, content_type_id: number | string, object_id: number | string): Observable<Action[]> {
    let options = {};
    let params = new HttpParams();

    if (content_type_id) {
      params = params.set('content_type_id', content_type_id.toString());
    }

    if (object_id) {
      params = params.set('object_id', object_id.toString());
    }

    options = {params: params};

    return this.http.get<Action[]>(`${url}`, options)
      .pipe(
        map(response => {
          return this.getProperlyTypedActions(response);
        }),
        catchError(this.errorService.handleError<Action[]>('getStream', (e: any) => 
        { 
          this.alertService.error('Unable to fetch stream');
        }, []))
      );
  }

  getProperlyTypedActions(actions: Action[]): Action[] {
    if (actions) {
      for (let action of actions) {
        action.timestamp = new Date(action.timestamp);
      }
    }

    return actions;
  }

  toggleLike(content_type_id: number|string, object_id: number|string): Observable<any> {
    return this.http.post<any>(this.toggleLikeUrl, 
      {content_type_id: content_type_id.toString(), object_id: object_id.toString()}, this.httpOptions)
    .pipe(
      catchError(this.errorService.handleError<any>('toggleLike', (e: any) => 
      {
        this.alertService.error('Unable to like, try again later');
      }, {}))
    );
  }
}
