import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { AuthService } from '../auth.service';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService,
    private authService: AuthService,
  ) { }

  getCanMessage(username: string): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      return of(false);
    }

    if (this.authService.getUsername() == username) {
      return of(false);
    }

    // todo: check specific message permissions, when created

    return of(true);
  }
}
