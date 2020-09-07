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
  private approveFollowRequestUrl= `${environment.apiUrl}/approve-follow-request/`;
  private rejectFollowRequestUrl= `${environment.apiUrl}/reject-follow-request/`;
  private unfollowUrl= `${environment.apiUrl}/unfollow/`;
  private followersUrl= `${environment.apiUrl}/followers/`;
  private followingUrl= `${environment.apiUrl}/following/`;
  private followRequestsUrl = `${environment.apiUrl}/follow-requests/`;
  private isFollowingUrl= `${environment.apiUrl}/is-following/`;

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService,
    private authService: AuthService,
  ) { }

  follow(user_id: number): Observable<any> {
    return this.http.post<any>(`${this.followUrl}`, {user_id})
    .pipe(
      catchError(this.errorService.handleError<any>('follow', (e: any) => 
      {
        this.alertService.error('Unable to follow, try again later');
      }, {followed: false, requested: false}))
    );
  }

  approveFollowRequest(user_id: number): Observable<any> {
    return this.http.post<any>(`${this.approveFollowRequestUrl}`, {user_id})
    .pipe(
      catchError(this.errorService.handleError<any>('approveFollowRequest', (e: any) => 
      {
        this.alertService.error('Unable to approve follow request, try again later');
      }, {}))
    );
  }

  rejectFollowRequest(user_id: number): Observable<any> {
    return this.http.post<any>(`${this.rejectFollowRequestUrl}`, {user_id})
    .pipe(
      catchError(this.errorService.handleError<any>('rejectFollowRequest', (e: any) => 
      {
        this.alertService.error('Unable to reject follow request, try again later');
      }, {}))
    );
  }

  unfollow(user_id: number): Observable<any> {
    return this.http.post<any>(`${this.unfollowUrl}`, 
      {user_id})
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

  isFollowing(username: string): Observable<any> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (username) {
      options = {params: params};
    }

    return this.http.get<any>(`${this.isFollowingUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<any>('isFollowing', (e: any) => 
        { 
          this.alertService.error('Unable to fetch is following');
        }, { following: false, requested: false }))
      );
  }

  getFollowRequests(page: number = null, page_size: number = null): Observable<Paginated<User>> {
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

    return this.http.get<Paginated<User>>(`${this.followRequestsUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<Paginated<User>>('requests', (e: any) => 
        { 
          this.alertService.error('Unable to fetch follow requests');
        }, new Paginated<User>()))
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
