import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AlertService } from '../alert/alert.service';
import { AuthService } from '../auth.service';
import { ErrorService } from '../error.service';
import { User } from '../user';
import { Paginated } from './paginated';

@Injectable({
  providedIn: 'root'
})
export class BlockService {
  private blockUrl = `${environment.apiUrl}/block/`;
  private unblockUrl = `${environment.apiUrl}/unblock/`;
  private blockedUsersUrl = `${environment.apiUrl}/blocked-users/`;
  private isBlockedUrl = `${environment.apiUrl}/is-blocked/`;

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService,
    private authService: AuthService,
  ) { }

  block(user_id: number): Observable<any> {
    return this.http.post<any>(`${this.blockUrl}`, {user_id})
    .pipe(
      catchError(this.errorService.handleError<any>('block', (e: any) => 
      {
        this.alertService.error('Unable to block, try again later');
      }, {error: true}))
    );
  }

  unblock(user_id: number): Observable<any> {
    return this.http.post<any>(`${this.unblockUrl}`, {user_id})
    .pipe(
      catchError(this.errorService.handleError<any>('unblock', (e: any) => 
      {
        this.alertService.error('Unable to unblock, try again later');
      }, {error:true}))
    );
  }

  isBlocked(username: string): Observable<any> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (username) {
      options = {params: params};
    }

    return this.http.get<any>(`${this.isBlockedUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<any>('isBlocked', (e: any) => 
        { 
          this.alertService.error('Unable to fetch is blocked');
        }, false))
      );
  }

  getBlockedUsers(username: string, page: number = null, page_size: number = null): Observable<Paginated<User>> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    if (username || page || page_size) {
      options = {params: params};
    }

    return this.http.get<Paginated<User>>(`${this.blockedUsersUrl}`, options);
  }
}
