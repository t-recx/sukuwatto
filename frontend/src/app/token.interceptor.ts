import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Token } from './token';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    private isRefreshing = false;
    private refreshSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private lastUrlBeforeRefresh: string = null;

    constructor(
        public authService: AuthService,
        private router: Router,
        ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            withCredentials: true
        });

        if (this.authService.isLoggedIn()) {

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
        }

        return next.handle(request).pipe(catchError(error => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                if (this.authService.isLoggedIn()) {
                    if (request.url.endsWith('/api/refresh/')) {
                        return this.authService.logout().pipe(
                            switchMap(() => {
                                this.authService.redirectUrl = this.lastUrlBeforeRefresh;

                                this.router.navigate(['/login']);

                                return of(new HttpResponse({status: 200}));
                            })
                        );
                    }
                    else {
                        return this.refreshTokenAndContinue(request, next);
                    }
                }
                else {
                    if (request.url.endsWith('/api/token/')) {
                        return throwError(error);
                    }
                    else {
                        this.authService.redirectUrl = this.lastUrlBeforeRefresh;

                        this.router.navigate(['/login']);

                        return of(new HttpResponse({status: 200}));
                    }
                }
            } 
            else {
                return throwError(error);
            }
        }));
    }

    private refreshTokenAndContinue(request: HttpRequest<any>, next: HttpHandler) {
        this.lastUrlBeforeRefresh = window.location.pathname;

        return this.authService.refresh().pipe(
            switchMap((token: Token) => {
                return next.handle(request);
            })
        );
    }

    private getCookie(name) {
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
}
