import { Injectable } from '@angular/core';
import { WorkingWeight } from './working-weight';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkingWeightsService {
  private workingWeightsUrl= `${environment.apiUrl}/working-weights/`;

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  getWorkingWeights (username: string, date_lte: Date): Observable<WorkingWeight[]> {
    return this.http.get<WorkingWeight[]>(`${this.workingWeightsUrl}?username=${username}&date_lte=${date_lte}`)
      .pipe(
        catchError(this.errorService.handleError<WorkingWeight[]>('getWorkingWeights', (e: any) => 
        { 
          this.alertService.error('Unable to fetch working weights');
        }, []))
      );
  }
}
