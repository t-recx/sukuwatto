import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getProperlyTypedActions(actions: Action[]): Action[] {
    if (actions) {
      for (let action of actions) {
        action.timestamp = new Date(action.timestamp);
      }
    }

    return actions;
  }
}
