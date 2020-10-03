import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError, BehaviorSubject, of, Subject } from 'rxjs';
import { catchError, filter, take, switchMap, tap, finalize } from 'rxjs/operators';
import { Token } from './token';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(
        public authService: AuthService,
        private router: Router,
    ) { }

    isRefreshingToken: boolean = false;
    tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshingToken) {
            this.isRefreshingToken = true;

            // Reset here so that the following requests wait until the token
            // comes back from the refreshToken call.
            this.tokenSubject.next(null);

            return this.authService.refresh()
                .pipe(
                    switchMap((token) => {
                        this.tokenSubject.next(token.access);
                        return next.handle(request);
                    }),
                    finalize(() => {
                        this.isRefreshingToken = false;
                    })
                );
        } else {
            this.isRefreshingToken = false;

            return this.tokenSubject
                .pipe(filter(token => token != null),
                    take(1),
                    switchMap(token => {
                        return next.handle(request);
                    }));
        }
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
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

        return next.handle(request)
            .pipe(
                catchError(err => {
                    if (err instanceof HttpErrorResponse) {
                        switch ((err as HttpErrorResponse).status) {
                            case 401:
                                if (err.url.endsWith('/api/refresh/')) {
                                    return this.authService.logout().pipe(
                                        tap(() => {
                                            this.authService.redirectUrl = window.location.pathname;
                                            this.authService.refreshExpired.next();
                                            this.router.navigate(['/login']);
                                        })
                                    );
                                }
                                else if (err.url.endsWith('/api/token/')) {
                                    return throwError(err);
                                }
                                else {
                                    return this.handle401Error(request, next);
                                }
                            default:
                                return throwError(err);
                        }
                    } else {
                        return throwError(err);
                    }
                }));
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
