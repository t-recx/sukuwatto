import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from './token';
import { User } from './user';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { AlertService } from './alert/alert.service';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  redirectUrl: string;

  username: string;

  public user: User;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private userService: UserService,
    private errorService: ErrorService,
    private alertService: AlertService) {
    this.username = this.getUsername();
  }

  login(user: User): Observable<Token> {
    return this.http.post<Token>(`${environment.apiUrl}/token/`, user, this.httpOptions)
      .pipe(
        tap((newToken: Token) => {
          this.setSession(user, newToken);
          this.loadUser(user.username);
        }),
        catchError(this.errorService.handleError<Token>('login', (e: any) => {
          if (e && e.status && e.status == 401) {
            this.alertService.error('Incorrect username or password');
          }
          else {
            this.alertService.error('Unable to sign in, try again later');
          }
        }))
      );
  }

  public logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  refresh(): Observable<Token> {
    return this.http.post<Token>(`${environment.apiUrl}/refresh/`, { refresh: this.getTokenRefresh() }, this.httpOptions)
      .pipe(
        tap((newToken: Token) => this.setTokenAccess(newToken.access)),
        catchError(this.errorService.handleError<Token>('refresh'))
      );
  }

  public isLoggedIn(): boolean {
    if (this.jwtHelper.tokenGetter()) {
      return !this.jwtHelper.isTokenExpired(this.jwtHelper.tokenGetter());
    }

    return false;
  }

  public canRefresh(): boolean {
    return !this.jwtHelper.isTokenExpired(this.getTokenRefresh());
  }

  public getUsername(): string {
    return localStorage.getItem('username');
  }

  private setSession(user: User, token: Token) {
    this.setTokenAccess(token.access);
    localStorage.setItem('refresh_token', token.refresh);
    localStorage.setItem('username', user.username);
    this.username = user.username;
  }

  private loadUser(username: string) {
    this.userService.get(username).subscribe(users => {
      if (users.length > 0) { this.user = users[0]; }
      else { this.user = null; }
    });
  }

  private setTokenAccess(access: string) {
    localStorage.setItem('access_token', access);
  }

  private getTokenRefresh(): string {
    return localStorage.getItem('refresh_token');
  }
}
