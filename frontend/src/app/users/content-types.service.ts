import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { Observable } from 'rxjs';
import { catchError, shareReplay, concatMap } from 'rxjs/operators';
import { ContentType } from './content-type';

@Injectable({
  providedIn: 'root'
})
export class ContentTypesService {
  private resourceUrl= `${environment.apiUrl}/content-types/`;
  private cache$: Observable<ContentType[]>;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  get(model: string): Observable<ContentType> {
    return this.getContentTypes().pipe(
      concatMap(types => new Observable<ContentType>(x => {
        if (types && types.filter(t => t.model == model).length > 0) {
          x.next(types.filter(t => t.model == model)[0]);
        }
        x.complete();
        })));
  }

  getContentTypes(): Observable<ContentType[]> {
    if (!this.cache$) {
      this.cache$ =
        this.requestGet().pipe(
          shareReplay({ bufferSize: 1, refCount: true }),
          catchError(this.errorService.handleError<ContentType[]>('get', (e: any) => 
          { 
            this.alertService.error('Unable to fetch content types');
          }, []))
        );
    }

    return this.cache$;
  }

  requestGet() : Observable<ContentType[]> {
    let options = {};

    return this.http.get<ContentType[]>(`${this.resourceUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<ContentType[]>('get', (e: any) => 
        { 
          this.alertService.error('Unable to fetch content types');
        }, []))
      );
  }

}
