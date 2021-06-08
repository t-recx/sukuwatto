import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { User } from './user';
import { Observable, Subject } from 'rxjs';
import { catchError, tap, shareReplay, map } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { AlertService } from './alert/alert.service';
import { environment } from 'src/environments/environment';
import { Paginated } from './users/paginated';
import { UserRegistration } from './users/user-registration';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersApiUrl = `${environment.apiUrl}/users/`;
  private usersRequestDataApiUrl = `${environment.apiUrl}/request-personal-data/`;
  private userExistsApiUrl = `${environment.apiUrl}/user-exists/`;
  private usersRegistrationApiUrl = `${environment.apiUrl}/sign-up/`;
  private usersSearchApiUrl = `${environment.apiUrl}/users-search/`;
  private userApiUrl = `${environment.apiUrl}/get-user/`;
  private usersEmailApiUrl = `${environment.apiUrl}/user-email/`;
  private usersChangePasswordApiUrl = `${environment.apiUrl}/user-change-password/`;
  private usersProfileFilenameApiUrl = `${environment.apiUrl}/user-profile-filename/`;
  private usersValidatePasswordApiUrl = `${environment.apiUrl}/user-validate-password/`;
  private usersResetPasswordApiUrl = `${environment.apiUrl}/password-reset/`;
  private usersResetPasswordConfirmApiUrl = `${environment.apiUrl}/password-reset-confirm/`;
  private usersResetPasswordValidateTokenApiUrl = `${environment.apiUrl}/password-reset-validate-token/`;
  private expressInterestApiUrl = `${environment.apiUrl}/express-interest/`;
  private banUserApiUrl = `${environment.apiUrl}/ban-user/`;
  private reinstateUserApiUrl = `${environment.apiUrl}/reinstate-user/`;

  userUpdated = new Subject<User>();

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private errorService: ErrorService,
    private alertService: AlertService) { }

  search(page: number, page_size: number, search_filter: string): Observable<Paginated<User>> {
    let options = {};
    let params = new HttpParams();

    if (page) {
      params = params.set('page', page.toString());
    }

    if (search_filter) {
      params = params.set('search', search_filter);
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    options = {params: params};

    return this.http.get<Paginated<User>>(`${this.usersSearchApiUrl}`, options)
  }

  resetPasswordValidateToken(token: string): Observable<any> {
    return this.http.post<any>(`${this.usersResetPasswordValidateTokenApiUrl}`, { token }, this.httpOptions);
  }

  requestPersonalData(): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.usersRequestDataApiUrl}`, null, { observe: 'response' })
    .pipe(
      catchError(this.errorService.handleError<any>('requestPersonalData', (e: any) => 
      {
        this.alertService.error('Unable to request data, try again later');
      }, {error:true}))
    );
  }

  resetConfirmPassword(token: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.usersResetPasswordConfirmApiUrl}`, { token, password }, this.httpOptions);
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.usersResetPasswordApiUrl}`, { email }, this.httpOptions)
    .pipe(
      catchError(this.errorService.handleError<any>('resetPassword', (e: any) => 
      {
        if (e.error && e.error.email) {
          this.alertService.error(e.error.email.toString());
        }
        else {
          this.alertService.error('Unable to reset password, try again later');
        }
      }, {error:true}))
    );
  }

  expressInterest(email: string): Observable<any> {
    return this.http.post<User>(`${this.expressInterestApiUrl}`, {email}, this.httpOptions)
    ;
  }

  create(user: UserRegistration): Observable<UserRegistration> {
    return this.http.post<UserRegistration>(`${this.usersRegistrationApiUrl}`, user, this.httpOptions);
  }

  update(user: User): Observable<User> {
    return this.http.put<User>(`${this.usersApiUrl}${user.id}/`, user, this.httpOptions)
      .pipe(tap((updated: User) => { this.userUpdated.next(updated); }));
  }

  banUser(username: string): Observable<any> {
    return this.http.post<any>(this.banUserApiUrl, {username}, this.httpOptions);
  }

  reinstateUser(username: string): Observable<any> {
    return this.http.post<any>(this.reinstateUserApiUrl, {username}, this.httpOptions);
  }

  delete(user: User): Observable<User> {
    const id = typeof user === 'number' ? user : user.id;
    const url = `${this.usersApiUrl}${id}/`;

    return this.http.delete<User>(url, this.httpOptions).pipe(
      catchError(this.errorService.handleError<User>('deleteUser', (e: any) => 
      {
        this.alertService.error('Unable to delete user, try again later');
      }, new User()))
    );
  }

  userExists(username: string): Observable<boolean> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    options = {params: params};

    return this.http.get<boolean>(`${this.userExistsApiUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<boolean>('userExists', (e: any) => 
        { 
          this.alertService.error('Unable to check user existence');
        }, null))
      );
  }

  getUser(username: string): Observable<User> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    options = {params: params};

    return this.http.get<User>(`${this.userApiUrl}`, options)
      .pipe(
        tap(user => {
          if (user && this.authService.isLoggedIn() && user.username == this.authService.getUsername()) {
            // since we're getting the user anyway, we take the opportunity 
            // to refresh the authenticated user's info
            this.authService.loadUser(user);
          }
        }),
        catchError(this.errorService.handleError<User>('getUser', (e: any) => 
        { 
          if (e.status != 404) {
            this.alertService.error('Unable to fetch user');
          }
        }, null))
      );
  }

  validatePassword(user: User): Observable<string[]> {
    return this.http.post<string[]>(`${this.usersValidatePasswordApiUrl}`, user)
      .pipe(
        catchError(this.errorService.handleError<string[]>('validatePassword', (e: any) => 
        { 
          this.alertService.error('Unable to validate password');
        }, []))
      );
  }

  changePassword(old_password: string, new_password: string): Observable<string[]> {
    return this.http.post<string[]>(`${this.usersChangePasswordApiUrl}`, {old_password, new_password});
  }
  
  getEmail(): Observable<string> {
    return this.http.get<string>(`${this.usersEmailApiUrl}`, {})
      .pipe(
        catchError(this.errorService.handleError<string>('getEmail', (e: any) => 
        { 
          this.alertService.error('Unable to fetch user email');
        }, null))
      );
  }

  private cacheProfileFilename$ = {};

  getProfileFilename(username: string): Observable<string> {
    if (!(username in this.cacheProfileFilename$)) {
      this.cacheProfileFilename$[username] =
        this.requestProfileFilename(username).pipe(
          shareReplay({ bufferSize: 1, refCount: true }),
          catchError(this.errorService.handleError<string>('getProfileFilename', (e: any) => 
          { 
            this.alertService.error('Unable to fetch user profile filename');
          }, null))
        );
    }

    return this.cacheProfileFilename$[username];
  }

  requestProfileFilename(username: string): Observable<string> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    options = {params: params};

    return this.http.get<string>(`${this.usersProfileFilenameApiUrl}`, options);
  }
}
