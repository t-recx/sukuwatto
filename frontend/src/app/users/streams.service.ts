import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { Observable } from 'rxjs';
import { Paginated } from './paginated';
import { catchError, map, concatMap } from 'rxjs/operators';
import { Action } from './action';

@Injectable({
  providedIn: 'root'
})
export class StreamsService {
  private actionsUrl= `${environment.apiUrl}/user-stream/`;
  private userLikedUrl= `${environment.apiUrl}/user-liked/`;
  private actorUrl= `${environment.apiUrl}/actor-stream/`;
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

  getUserStream(page: number, page_size: number): Observable<Paginated<Action>> {
    return this.getStreamForUser(this.actionsUrl, page, page_size);
  }

  getActorStream(username: string, page: number, page_size: number): Observable<Paginated<Action>> {
    return this.getStreamForUser(this.actorUrl, page, page_size, username);
  }

  getActionObjectStream(content_type_id: number | string, object_id: number | string): Observable<Action[]> {
    return this.getObjectStream(this.actionsObjectsUrl, content_type_id, object_id);
  }

  getTargetStream(content_type_id: number | string, object_id: number | string, verb: string = null, actor_content_type_id: number = null, actor_object_id: number = null): Observable<Action[]> {
    return this.getObjectStream(this.targetUrl, content_type_id, object_id, verb, actor_content_type_id, actor_object_id);
  }

  userLikedContent(content_type_id: number | string, object_id: number | string, actor_content_type_id: number, actor_object_id: number): Observable<boolean> {
    let options = {};
    let params = new HttpParams();
    const verb = 'liked';

    if (content_type_id) {
      params = params.set('content_type_id', content_type_id.toString());
    }

    if (object_id) {
      params = params.set('object_id', object_id.toString());
    }

    if (verb) {
      params = params.set('verb', verb.toString());
    }

    if (actor_content_type_id) {
      params = params.set('actor_content_type_id', actor_content_type_id.toString());
    }

    if (actor_object_id) {
      params = params.set('actor_object_id', actor_object_id.toString());
    }

    options = {params: params};

    return this.http.get<boolean>(this.userLikedUrl, options)
      .pipe(
        catchError(this.errorService.handleError<boolean>('userLikedContent', (e: any) => 
        { 
          this.alertService.error('Unable to fetch user likes');
        }, false))
      );
  }

  private getStreamForUser(url: string, page: number, page_size: number, username: string = null): Observable<Paginated<Action>> {
    let options = {};
    let params = new HttpParams();

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    if (username) {
      params = params.set('username', username);
    }

    if (page || page_size || username) {
      options = {params: params};
    }

    return this.http.get<Paginated<Action>>(url, options)
      .pipe(
        map(response => {
          if (response.results) {
            response.results = this.getProperlyTypedActions(response.results);
          }
          return response;
        }),
        catchError(this.errorService.handleError<Paginated<Action>>('getStream', (e: any) => 
        { 
          this.alertService.error('Unable to fetch stream');
        }, new Paginated<Action>()))
      );
  }

  private getObjectStream(url: string, content_type_id: number | string, object_id: number | string,
    verb: string = null, actor_content_type_id: number = null, actor_object_id: number = null): Observable<Action[]> {
    let options = {};
    let params = new HttpParams();

    if (content_type_id) {
      params = params.set('content_type_id', content_type_id.toString());
    }

    if (object_id) {
      params = params.set('object_id', object_id.toString());
    }

    if (verb) {
      params = params.set('verb', verb.toString());
    }

    if (actor_content_type_id) {
      params = params.set('actor_content_type_id', actor_content_type_id.toString());
    }

    if (actor_object_id) {
      params = params.set('actor_object_id', actor_object_id.toString());
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
}
