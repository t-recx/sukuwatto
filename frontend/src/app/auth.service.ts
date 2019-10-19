import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from './token';
import { User } from './user';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AlertService } from './alert.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  redirectUrl: string;

  private apiUrl = 'http://localhost:8000/api';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient, 
    private jwtHelper: JwtHelperService,
    private errorService: ErrorService,
    private alertService: AlertService) { }

  login(user: User): Observable<Token> {
    return this.http.post<Token>(`${this.apiUrl}/token/`, user, this.httpOptions)
    .pipe(
      tap((newToken: Token) => this.setSession(newToken)),
      catchError(this.errorService.handleError<Token>('login', (e: any) => 
      {
        if (e && e.status && e.status == 401) {
          this.alertService.error('Incorrect username or password');
        }
        else {
          this.alertService.error('Unable to sign in, try again later');
        }
      }))
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  refresh(): Observable<Token> {
    return this.http.post<Token>(`${this.apiUrl}/refresh/`, { refresh: this.getTokenRefresh()}, this.httpOptions)
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

  private setSession(token: Token) {
    this.setTokenAccess(token.access);
    localStorage.setItem('refresh_token', token.refresh);
  }

  private setTokenAccess(access: string) {
    localStorage.setItem('access_token', access);
  }

  private getTokenRefresh(): string {
    return localStorage.getItem('refresh_token');
  }
}
