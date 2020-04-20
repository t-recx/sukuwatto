import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Token } from './token';
import { Router } from '@angular/router';
import { ErrorService } from './error.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    private isRefreshing = false;
    private refreshSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        public authService: AuthService,
        private router: Router,
        private errorService: ErrorService,
        ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.authService.getAccessToken()) {
            request = this.addToken(request, this.authService.getAccessToken());
        }

        return next.handle(request).pipe(catchError(error => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                console.log('error 401');
                if (this.authService.getTokenRefresh()) {
                    console.log('refreshing');
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
                    console.log('loggingout');
                    this.authService.logout();
                    this.router.navigate(['/login']);

                    return throwError(error);
                }
            } 
            else {
                    console.log('throwing error');
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
        console.log('refreshTokenAndContinue');
        console.log('isRefreshing:');
        console.log(this.isRefreshing);
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshSubject.next(null);

            return this.authService.refresh().pipe(
                switchMap((token: Token) => {
                    console.log('entered switch map');

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
