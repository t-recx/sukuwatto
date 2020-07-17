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
  private isFollowingUrl= `${environment.apiUrl}/is-following/`;

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

    return of(true);
  }

  isFollowing(username: string): Observable<boolean> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (username) {
      options = {params: params};
    }

    return this.http.get<boolean>(`${this.isFollowingUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<boolean>('isFollowing', (e: any) => 
        { 
          this.alertService.error('Unable to fetch is following');
        }, false))
      );
  }

  getFollowing(username: string, page: number = null, page_size: number = null): Observable<Paginated<User>> {
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

    return this.http.get<Paginated<User>>(`${this.followingUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<Paginated<User>>('following', (e: any) => 
        { 
          this.alertService.error('Unable to fetch following');
        }, new Paginated<User>()))
      );
  }

  getFollowers(username: string, page: number = null, page_size: number = null): Observable<Paginated<User>> {
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

    return this.http.get<Paginated<User>>(`${this.followersUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<Paginated<User>>('followers', (e: any) => 
        { 
          this.alertService.error('Unable to fetch followers');
        }, new Paginated<User>()))
      );
  }
}
