import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Token } from './token';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    private isRefreshing = false;
    private refreshSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        public authService: AuthService,
        private router: Router,
        ) { }

    getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
                withCredentials: true
            });

        if (request.method != 'GET' && request.method != 'HEAD' && request.method != 'OPTIONS') {
            const csrftoken = this.getCookie('csrftoken');

            if (csrftoken) {
                request = request.clone({
                    setHeaders: {
                        'X-CSRFToken': csrftoken
                    }
                });
            }
        }

        return next.handle(request);

        if (this.authService.getAccessToken()) {
            request = this.addToken(request, this.authService.getAccessToken());
        }

        return next.handle(request).pipe(catchError(error => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                if (this.authService.getTokenRefresh()) {
                    if (this.isRefreshing) {
                        this.isRefreshing = false;
                        this.authService.logout();
                        this.router.navigate(['/login']);
                        return throwError(error);
                    }
                    else {
                        return this.refreshTokenAndContinue(request, next);
                    }
                }
                else {
                    this.authService.logout();
                    this.router.navigate(['/login']);

                    return throwError(error);
                }
            } 
            else {
                return throwError(error);
            }
        }));
    }

    private addToken(request: HttpRequest<any>, token: string) {
        return request.clone({
            setHeaders: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    private refreshTokenAndContinue(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshSubject.next(null);

            return this.authService.refresh().pipe(
                switchMap((token: Token) => {
                    this.authService.setTokenAccess(token.access);
                    this.isRefreshing = false;
                    this.refreshSubject.next(token.access);
                    return next.handle(this.addToken(request, token.access));
                })
                );

        } else {
            return this.refreshSubject.pipe(
                filter(token => token != null),
                take(1),
                switchMap(jwt => {
                    return next.handle(this.addToken(request, jwt));
                }));
        }
    }
}
