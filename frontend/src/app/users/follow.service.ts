import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { Observable, of } from 'rxjs';
import { AuthService } from '../auth.service';
import { User } from '../user';
import { Paginated } from './paginated';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private followUrl= `${environment.apiUrl}/follow/`;
  private unfollowUrl= `${environment.apiUrl}/unfollow/`;
  private followersUrl= `${environment.apiUrl}/followers/`;
  private followingUrl= `${environment.apiUrl}/following/`;

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService,
    private authService: AuthService,
  ) { }

  follow(content_type_id: number, object_id: number): Observable<any> {
    return this.http.post<any>(`${this.followUrl}`, {content_type_id: content_type_id, object_id: object_id})
    .pipe(
      catchError(this.errorService.handleError<any>('follow', (e: any) => 
      {
        this.alertService.error('Unable to follow, try again later');
      }, {}))
    );
  }

  unfollow(content_type_id: number, object_id: number): Observable<any> {
    return this.http.post<any>(`${this.unfollowUrl}`, 
      {content_type_id: content_type_id, object_id: object_id})
    .pipe(
      catchError(this.errorService.handleError<any>('unfollow', (e: any) => 
      {
        this.alertService.error('Unable to unfollow, try again later');
      }, {}))
    );
  }

  getCanFollow(username: string): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      return of(false);
    }

    if (this.authService.getUsername() == username) {
      return of(false);
    }

    // todo: check permissions??

    return of(true);
  }

  getFollowing(username: string): Observable<User[]> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (username) {
      options = {params: params};
    }

    return this.http.get<User[]>(`${this.followingUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<User[]>('following', (e: any) => 
        { 
          this.alertService.error('Unable to fetch following');
        }, []))
      );
  }

  getFollowers(username: string): Observable<User[]> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (username) {
      options = {params: params};
    }

    return this.http.get<User[]>(`${this.followersUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<User[]>('followers', (e: any) => 
        { 
          this.alertService.error('Unable to fetch followers');
        }, []))
      );
  }
}
