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

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtService,
    private userService: UserService,
    private errorService: ErrorService,
    private alertService: AlertService) {
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
    this.setUsername(null);
    this.setTokenAccess(null);
    this.setTokenRefresh(null);
    this.setUnitSystem(null);
    this.setUserWeightUnitId(null);
    this.setUserID(null);
  }

  refresh(): Observable<Token> {
    return this.http.post<Token>(`${environment.apiUrl}/refresh/`, { refresh: this.getTokenRefresh() }, this.httpOptions)
      .pipe(
        tap((newToken: Token) => this.setTokenAccess(newToken.access)),
        catchError(this.errorService.handleError<Token>('refresh'))
      );
  }

  public isCurrentUserLoggedIn(username: string): boolean {
    if (!this.isLoggedIn()) {
      return false;
    }

    if (username != this.getUsername()) {
      return false;
    }

    return true;
  }

  public isLoggedIn(): boolean {
    if (this.getTokenRefresh()) {
      return !this.jwtHelper.isTokenExpired(this.getTokenRefresh());
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

  private setSession(user: User, token: Token) {
    this.setTokenAccess(token.access);
    this.setTokenRefresh(token.refresh);
    this.setUsername(user.username)
  }

  private setUserData(username: string) {
    this.userService.get(username).subscribe(users => {
      if (users.length > 0) { 
        this.setUnitSystem(users[0].system);
        this.setUserWeightUnitId(null);

        if (users[0].system) {
            this.unitsService.getUnits().subscribe(u => {
                const userUnit = u.filter(x => x.system == users[0].system && x.measurement_type == MeasurementType.Weight)[0]
                if (userUnit) { 
                    this.setUserWeightUnitId(userUnit.id);
                }
            });
        }

        this.setUserID(users[0].id.toString());
      }
    });
  }

  private getLocalStorageItem(key: string): string {
    return localStorage.getItem(key);
  }

  private setLocalStorageItem(key: string, value: string) {
    if (value) {
      localStorage.setItem(key, value);
    }
    else {
      localStorage.removeItem(key);
    }
  }

  public getAccessToken(): string {
    return this.getLocalStorageItem('access_token');
  }

  public getUsername(): string {
    return this.getLocalStorageItem('username');
  }

  public getUserId(): string {
    return this.getLocalStorageItem('user_id');
  }

  public getUserUnitSystem(): string {
    return this.getLocalStorageItem('unit_system');
  }

  public getTokenRefresh(): string {
    return this.getLocalStorageItem('refresh_token');
  }

  public getUserWeightUnitId(): string {
    return this.getLocalStorageItem('weight_unit_id');
  }

  public setUserWeightUnitId(unit: string) {
    this.setLocalStorageItem('weight_unit_id', unit);
  }

  public setUnitSystem(system: string) {
    this.setLocalStorageItem('unit_system', system);
  }

  private setUserID(id: string) {
    this.setLocalStorageItem('user_id', id);
  }

  private setUsername(username: string) {
    this.setLocalStorageItem('username', username);
  }

  private setTokenAccess(access: string) {
    this.setLocalStorageItem('access_token', access);
  }

  private setTokenRefresh(refresh: string) {
    this.setLocalStorageItem('refresh_token', refresh);
  }
}
