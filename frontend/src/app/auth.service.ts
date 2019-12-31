import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from './token';
import { User } from './user';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { AlertService } from './alert/alert.service';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  redirectUrl: string;

  username: string;
  access_token: string;
  refresh_token: string;
  unit_system: string;
  user_id: string;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtService,
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
          this.setUserData(user.username);
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
    this.username = null;
    this.access_token = null;
    this.refresh_token = null;
    this.unit_system = null;
    this.user_id = null;
  }

  refresh(): Observable<Token> {
    return this.http.post<Token>(`${environment.apiUrl}/refresh/`, { refresh: this.getTokenRefresh() }, this.httpOptions)
      .pipe(
        tap((newToken: Token) => this.setTokenAccess(newToken.access)),
        catchError(this.errorService.handleError<Token>('refresh'))
      );
  }

  public getAccessToken(): string {
    return this.access_token;
  }

  public isLoggedIn(): boolean {
    if (this.getAccessToken()) {
      return !this.jwtHelper.isTokenExpired(this.getAccessToken());
    }

    return false;
  }

  public tokenExpired(): boolean {
    if (this.getAccessToken()) {
      return this.jwtHelper.isTokenExpired(this.getAccessToken());
    }

    return false;
  }

  public canRefresh(): boolean {
    return !this.jwtHelper.isTokenExpired(this.getTokenRefresh());
  }

  public getUsername(): string {
    return this.username;
  }

  public getUserId(): string {
    return this.user_id;
  }

  public getUserUnitSystem(): string {
    return this.unit_system;
  }

  private setSession(user: User, token: Token) {
    this.setTokenAccess(token.access);
    this.refresh_token =  token.refresh;
    this.username = user.username;
    this.username = user.username;
  }

  private setUserData(username: string) {
    this.userService.get(username).subscribe(users => {
      if (users.length > 0) { 
        this.unit_system = users[0].system;
        this.user_id = users[0].id.toString();
      }
    });
  }

  private setTokenAccess(access: string) {
    this.access_token = access;
  }

  private getTokenRefresh(): string {
    return this.refresh_token;
  }
}
