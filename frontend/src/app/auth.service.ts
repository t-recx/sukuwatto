import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from './token';
import { User } from './user';
import { Observable } from 'rxjs';
import { catchError, tap, concatMap } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { AlertService } from './alert/alert.service';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  redirectUrl: string = null;

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

  login(username: string, email: string, password: string): Observable<Token> {
    if (!username || username.trim().length == 0) {
      return this.userService.getUser(null, email).pipe(
        concatMap(user => {
          if (!user) {
            this.alertService.error('Incorrect username or password');

            return new Observable<Token>(o => {
              o.next(null);
              o.complete();
            });
          }

          user.password = password;

          return this.loginByUser(user);
        })
      );
    }

    return this.loginByUser(new User({username, password}));
  }

  loginByUser(user: User): Observable<Token> {
    return this.http.post<Token>(`${environment.apiUrl}/token/`, user, this.httpOptions)
      .pipe(
        tap((newToken: Token) => {
          if (newToken) {
            this.setSession(user, newToken);
            this.setUserData(user.username);
          }
        }),
        catchError(this.errorService.handleError<Token>('login', (e: any) => {
          if (e && e.status && e.status == 401) {
            this.alertService.error('Incorrect username or password');
          }
          else {
            this.alertService.error('Unable to sign in, try again later');
          }
        }, null))
      );
  }

  public clearUser() {
    this.setIsLoggedIn(null);
    this.setUsername(null);
    this.setUnitSystem(null);
    this.setUserWeightUnitId(null);
    this.setUserDistanceUnitId(null);
    this.setUserSpeedUnitId(null);
    this.setUserID(null);
    this.setIsStaff(null);
    this.setUserDefaultWorkoutVisibility(null);
  }

  public getLogoutUrl(): string {
    return `${environment.apiUrl}/logout/`;
  }

  public logout(): Observable<any> {
    return this.http.post<any>(this.getLogoutUrl(), { }, this.httpOptions).pipe(
      tap(x => {
        this.clearUser();
      }),
      catchError(this.errorService.handleError<any>('logout', (e: any) => {
        this.alertService.error('Unable to sign out, try again later');
      }))
    );
  }

  public refresh(): Observable<Token> {
    return this.http.post<Token>(`${environment.apiUrl}/refresh/`, {  }, this.httpOptions);
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
    return this.getIsLoggedIn() == 'true';
  }

  private setIsLoggedIn(value: string) {
    this.setLocalStorageItem('logged_in', value);
  }

  private setSession(user: User, token: Token) {
    this.setIsLoggedIn('true');
    this.setTokenMessaging(token.messaging);
    this.setUsername(user.username)
  }

  private setUserData(username: string) {
    this.userService.getUser(username).subscribe(user => {
      if (user) { 
        this.setUnitSystem(user.system);
        this.setUserWeightUnitId(user.default_weight_unit.toString());
        this.setUserDistanceUnitId(user.default_distance_unit.toString());
        this.setUserSpeedUnitId(user.default_speed_unit.toString());
        this.setUserDefaultWorkoutVisibility(user.default_visibility_workouts);

        this.setUserID(user.id.toString());
        this.setIsStaff(user.is_staff);
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

  public getIsLoggedIn(): string {
    return this.getLocalStorageItem('logged_in');
  }

  public getMessagingToken(): string {
    return this.getLocalStorageItem('messaging_token');
  }

  public getUsername(): string {
    return this.getLocalStorageItem('username');
  }

  public getUserId(): string {
    return this.getLocalStorageItem('user_id');
  }

  public userIsStaff(): boolean {
    return this.getLocalStorageItem('is_staff') == 'true';
  }

  public getUserUnitSystem(): string {
    return this.getLocalStorageItem('unit_system');
  }

  public getUserWeightUnitId(): string {
    return this.getLocalStorageItem('weight_unit_id');
  }

  public getUserDistanceUnitId(): string {
    return this.getLocalStorageItem('distance_unit_id');
  }

  public getUserSpeedUnitId(): string {
    return this.getLocalStorageItem('speed_unit_id');
  }

  public getUserDefaultWorkoutVisibility(): string {
    return this.getLocalStorageItem('default_workout_visibility');
  }

  public setUserDefaultWorkoutVisibility(v: string) {
    this.setLocalStorageItem('default_workout_visibility', v);
  }

  public setUserWeightUnitId(unit: string) {
    this.setLocalStorageItem('weight_unit_id', unit);
  }

  public setUserDistanceUnitId(unit: string) {
    this.setLocalStorageItem('distance_unit_id', unit);
  }

  public setUserSpeedUnitId(unit: string) {
    this.setLocalStorageItem('speed_unit_id', unit);
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

  private setIsStaff(is_staff: boolean) {
    this.setLocalStorageItem('is_staff', is_staff ? is_staff.toString() : null);
  }

  setTokenMessaging(token: string) {
    this.setLocalStorageItem('messaging_token', token);
  }
}
