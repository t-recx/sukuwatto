import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { User } from './user';
import { Observable } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { AlertService } from './alert/alert.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersApiUrl = `${environment.apiUrl}/users/`;
  private userApiUrl = `${environment.apiUrl}/get-user/`;
  private usersEmailApiUrl = `${environment.apiUrl}/user-email/`;
  private usersChangePasswordApiUrl = `${environment.apiUrl}/user-change-password/`;
  private usersProfileFilenameApiUrl = `${environment.apiUrl}/user-profile-filename/`;
  private usersValidatePasswordApiUrl = `${environment.apiUrl}/user-validate-password/`;
  private usersResetPasswordApiUrl = `${environment.apiUrl}/password-reset/`;
  private usersResetPasswordConfirmApiUrl = `${environment.apiUrl}/password-reset-confirm/`;
  private usersResetPasswordValidateTokenApiUrl = `${environment.apiUrl}/password-reset-validate-token/`;
  private expressInterestApiUrl = `${environment.apiUrl}/express-interest/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient, 
    private errorService: ErrorService,
    private alertService: AlertService) { }

  resetPasswordValidateToken(token: string): Observable<any> {
    return this.http.post<any>(`${this.usersResetPasswordValidateTokenApiUrl}`, { token }, this.httpOptions);
  }

  resetConfirmPassword(token: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.usersResetPasswordConfirmApiUrl}`, { token, password }, this.httpOptions)
    .pipe(
      catchError(this.errorService.handleError<any>('resetConfirmPassword', (e: any) => 
      {
        this.alertService.error('Unable to reset password, try again later');
      }, {error:true}))
    );
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.usersResetPasswordApiUrl}`, { email }, this.httpOptions)
    .pipe(
      catchError(this.errorService.handleError<any>('resetPassword', (e: any) => 
      {
        if (e.error && e.error.email) {
          this.alertService.error(e.error.email);
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

  create(user: User): Observable<User> {
    return this.http.post<User>(`${this.usersApiUrl}`, user, this.httpOptions)
    .pipe(
      catchError(this.errorService.handleError<User>('create', (e: any) => 
      {
        if (e.error && e.error.username) {
          this.alertService.error('Unable to sign up: username already taken');
        }
        else {
          this.alertService.error('Unable to sign up, try again later');
        }
      }))
    );
  }

  update(user: User): Observable<User> {
    return this.http.put<User>(`${this.usersApiUrl}${user.id}/`, user, this.httpOptions)
    .pipe(
      tap((newUser: User) => { }),
      catchError(this.errorService.handleError<User>('update', (e: any) => 
      {
        this.alertService.error('Unable to update account, try again later');
      }))
    );
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

  getUser(username: string, email: string = null): Observable<User> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (email) {
      params = params.set('email', email);
    }

    options = {params: params};

    return this.http.get<User>(`${this.userApiUrl}`, options)
      .pipe(
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
