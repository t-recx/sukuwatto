import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { User } from './user';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { AlertService } from './alert/alert.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient, 
    private errorService: ErrorService,
    private alertService: AlertService) { }

  create(user: User): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users/`, user, this.httpOptions)
    .pipe(
      tap((newUser: User) => { }),
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

  get(username: string): Observable<User[]> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    options = {params: params};

    return this.http.get<User[]>(`${environment.apiUrl}/users/`, options)
      .pipe(
        catchError(this.errorService.handleError<User[]>('getUser', (e: any) => 
        { 
          this.alertService.error('Unable to fetch users');
        }, []))
      );
  }
}
