import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AlertService } from '../alert/alert.service';
import { ErrorService } from '../error.service';
import { LeaderboardPosition, LeaderboardTimespan } from './leaderboard-position';
import { Paginated } from './paginated';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private weekLeaderboardDashboardUrl = `${environment.apiUrl}/weekly-leaderboard-dashboard/`;
  private monthLeaderboardDashboardUrl = `${environment.apiUrl}/monthly-leaderboard-dashboard/`;
  private yearLeaderboardDashboardUrl = `${environment.apiUrl}/yearly-leaderboard-dashboard/`;
  private alltimeLeaderboardDashboardUrl = `${environment.apiUrl}/alltime-leaderboard-dashboard/`;
  private weekLeaderboardUrl = `${environment.apiUrl}/weekly-leaderboard/`;
  private monthLeaderboardUrl = `${environment.apiUrl}/monthly-leaderboard/`;
  private yearLeaderboardUrl = `${environment.apiUrl}/yearly-leaderboard/`;
  private alltimeLeaderboardUrl = `${environment.apiUrl}/alltime-leaderboard/`;

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  get(timespan: LeaderboardTimespan, page: number, page_size: number, search_filter: string): Observable<Paginated<LeaderboardPosition>> {
    let options = {};
    let params = new HttpParams();

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    if (search_filter) {
      params = params.set('search', search_filter);
    }

    if (page || page_size || search_filter) {
      options = {params: params};
    }

    let url = this.weekLeaderboardUrl;

    switch (timespan) {
      case LeaderboardTimespan.Month:
        url = this.monthLeaderboardUrl;
        break;
      case LeaderboardTimespan.Year:
        url = this.yearLeaderboardUrl;
        break;
      case LeaderboardTimespan.AllTime:
        url = this.alltimeLeaderboardUrl;
        break;
    }

    return this.http.get<Paginated<LeaderboardPosition>>(url, options);
  }

  getDashboard(timespan: LeaderboardTimespan): Observable<LeaderboardPosition[]> {
    let url = this.weekLeaderboardDashboardUrl;

    switch (timespan) {
      case LeaderboardTimespan.Month:
        url = this.monthLeaderboardDashboardUrl;
        break;
      case LeaderboardTimespan.Year:
        url = this.yearLeaderboardDashboardUrl;
        break;
      case LeaderboardTimespan.AllTime:
        url = this.alltimeLeaderboardDashboardUrl;
        break;
    }

    return this.http.get<LeaderboardPosition[]>(url)
      .pipe(
        catchError(this.errorService.handleError<LeaderboardPosition[]>('getDashboard', (e: any) => 
        { 
          this.alertService.error('Unable to fetch leaderboard positions');
        }, []))
      );
  }
}
