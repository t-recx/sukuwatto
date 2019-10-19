import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from './user';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AlertService } from './alert.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8000/api';
  
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient, 
    private errorService: ErrorService,
    private alertService: AlertService) { }

  create(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/`, user, this.httpOptions)
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
}
