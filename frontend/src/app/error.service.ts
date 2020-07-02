import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AlertService } from './alert/alert.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private alertService: AlertService,
  ) { }

  handleError<T>(operation = 'operation', handler?: (e: any) => void, result?: T) {
    return (error: any): Observable<T> => {
      if (handler) {
        handler(error);
      }

      const errorMessage = `${operation} failed: ${error.message}`;

      if (!environment.production) {
        this.alertService.error(errorMessage);
      }

      console.log(errorMessage);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
