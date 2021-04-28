import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AlertService } from '../alert/alert.service';
import { ErrorService } from '../error.service';
import { Paginated } from './paginated';
import { Report, ReportState } from './report';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private reportsUrl = `${environment.apiUrl}/reports/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  getReport(id: number | string): Observable<Report> {
    return this.http.get<Report>(`${this.reportsUrl}${id}/`)
      .pipe(
        map(response => this.getProperlyTypedReport(response)),
        catchError(this.errorService.handleError<Report>('getReport', (e: any) => 
        { 
          if (e && e.status && e.status != 404) { 
            this.alertService.error('Unable to fetch report');
          }
        }, null))
      );
  }

  getReports(page: number = null, page_size: number = null, state: ReportState): Observable<Paginated<Report>> {
    let options = {};
    let params = new HttpParams();

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    if (state) {
      params = params.set('state', state.toString());
    }

    if (page || page_size || state) {
      options = {params: params};
    }

    return this.http.get<Paginated<Report>>(`${this.reportsUrl}`, options)
      .pipe(
        map(response => {
          if (response.results) {
            response.results = this.getProperlyTypedReports(response.results);
          }
          return response;
        })
      );
  }

  saveReport(report: Report): Observable<Report> {
    if (report.id && report.id > 0) {
      return this.updateReport(report);
    }

    return this.createReport(report);
  }

  createReport(report: Report): Observable<Report> {
    return this.http.post<Report>(this.reportsUrl, report, this.httpOptions)
    .pipe(
      catchError(this.errorService.handleError<Report>('createReport', (e: any) => 
      {
        this.alertService.error('Unable to create report, try again later');
      }, null))
    );
  }

  updateReport(report: Report): Observable<Report> {
    return this.http.put<Report>(`${this.reportsUrl}${report.id}/`, report, this.httpOptions)
    .pipe(
      tap((newReport: Report) => { }),
      catchError(this.errorService.handleError<Report>('updateReport', (e: any) => 
      {
        if (e && e.status && e.status == 403) {
          this.alertService.error('You don\'t have permission to update this report');
        }
        else {
          this.alertService.error('Unable to update report, try again later');
        }
      }, this.getProperlyTypedReport(report)))
    );
  }

  getProperlyTypedReports(reports: Report[]): Report[] {
    if (reports) {
      reports.forEach(report => {
        report = this.getProperlyTypedReport(report);
      });
    }

    return reports;
  }

  getProperlyTypedReport(report: Report): Report {
    report.date = new Date(report.date);
    report.edited_date = new Date(report.edited_date);

    return report;
  }
}
