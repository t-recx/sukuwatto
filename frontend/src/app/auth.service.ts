import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from './token';
import { User } from './user';
import { Observable, Subject } from 'rxjs';
import { catchError, tap, concatMap } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { AlertService } from './alert/alert.service';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import { JwtService } from './jwt.service';
import { Visibility } from './visibility';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  redirectUrl: string = null;
  refreshExpired = new Subject();

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService) {
  }

  login(username: string, password: string): Observable<Token> {
    username = username ? username.toLowerCase() : username;

    return this.http.post<Token>(`${environment.apiUrl}/token/`, {username, password}, this.httpOptions)
      .pipe(
        tap((newToken: Token) => {
          if (newToken) {
            this.setSession(newToken);
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
    this.setUserEnergyUnitId(null);
    this.setUserSpeedUnitId(null);
    this.setUserID(null);
    this.setIsStaff(null);
    this.setUserDefaultWorkoutVisibility(null);
    this.setUserDefaultMeasurementVisibility(null);
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

  private setSession(token: Token) {
    if (token.user) {
      this.setIsLoggedIn('true');

      this.setUsername(token.user.username);

      this.setUnitSystem(token.user.system);
      this.setUserWeightUnitId(token.user.default_weight_unit.toString());
      this.setUserDistanceUnitId(token.user.default_distance_unit.toString());
      this.setUserEnergyUnitId(token.user.default_energy_unit.toString());
      this.setUserSpeedUnitId(token.user.default_speed_unit.toString());
      this.setUserDefaultWorkoutVisibility(token.user.default_visibility_workouts);
      this.setUserDefaultMeasurementVisibility(token.user.default_visibility_user_bio_datas);

      this.setUserID(token.user.id.toString());
      this.setIsStaff(token.user.is_staff);
    }
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

  public getUsername(): string {
    return this.getLocalStorageItem('username');
  }

  public getUserId(): string {
    return this.getLocalStorageItem('user_id');
  }

  public userIsStaff(): boolean {
    return this.getLocalStorageItem('is_staff') == 'true';
  }

  public getUserDefaultActivityTypeStrength(): boolean {
    return this.getLocalStorageItem('default_activity_type_strength') == 'true';
  }

  public getUserUnitSystem(): string {
    return this.getLocalStorageItem('unit_system');
  }

  public getUserWeightUnitId(): string {
    return this.getLocalStorageItem('weight_unit_id');
  }

  public getUserEnergyUnitId(): string {
    return this.getLocalStorageItem('energy_unit_id');
  }

  public getUserDistanceUnitId(): string {
    return this.getLocalStorageItem('distance_unit_id');
  }

  public getUserSpeedUnitId(): string {
    return this.getLocalStorageItem('speed_unit_id');
  }

  stringToVisibility(defaultWorkoutVisibility: string): Visibility {
    if (defaultWorkoutVisibility && defaultWorkoutVisibility.length > 0) {
      switch (defaultWorkoutVisibility) {
        case Visibility.Everyone:
          return Visibility.Everyone;
        case Visibility.Followers:
          return Visibility.Followers;
        case Visibility.OwnUser:
          return Visibility.OwnUser;
        case Visibility.RegisteredUsers:
          return Visibility.RegisteredUsers;
      }
    }
    else {
      return Visibility.Everyone;
    }
  }

  public getUserDefaultWorkoutVisibility(): Visibility {
    return this.stringToVisibility(this.getLocalStorageItem('default_workout_visibility'));
  }

  public getUserDefaultMeasurementVisibility(): Visibility {
    return this.stringToVisibility(this.getLocalStorageItem('default_measurement_visibility'));
  }

  public setUserDefaultWorkoutVisibility(v: string) {
    this.setLocalStorageItem('default_workout_visibility', v);
  }

  public setUserDefaultMeasurementVisibility(v: string) {
    this.setLocalStorageItem('default_measurement_visibility', v);
  }

  public setUserWeightUnitId(unit: string) {
    this.setLocalStorageItem('weight_unit_id', unit);
  }

  public setUserDistanceUnitId(unit: string) {
    this.setLocalStorageItem('distance_unit_id', unit);
  }

  public setUserEnergyUnitId(unit: string) {
    this.setLocalStorageItem('energy_unit_id', unit);
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

  public setUserDefaultActivityTypeStrength(activityTypeStrength: boolean) {
    this.setLocalStorageItem('default_activity_type_strength', activityTypeStrength.toString());
  }
}
