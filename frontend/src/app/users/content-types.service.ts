import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ContentType } from './content-type';

@Injectable({
  providedIn: 'root'
})
export class ContentTypesService {
  private resourceUrl= `${environment.apiUrl}/content-types/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  get (model: string): Observable<ContentType[]> {
    let options = {};
    let params = new HttpParams();

    if (model) {
      params = params.set('model', model);
    }

    if (model) {
      options = {params: params};
    }

    return this.http.get<ContentType[]>(`${this.resourceUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<ContentType[]>('get', (e: any) => 
        { 
          this.alertService.error('Unable to fetch content types');
        }, []))
      );
  }

}
