import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { User } from '../user';
import { Router, ActivatedRoute } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { filter, map, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
import { ErrorService } from '../error.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  validatePasswordSubscription: Subscription;
  passwordValidations: string[];

  token: string;
  tokenExpired: boolean = false;

  triedToReset: boolean;
  resetting: boolean;
  resetText: string;

  newPassword: string = '';

  constructor(
    private userService: UserService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private errorService: ErrorService,
  ) { }

  ngOnInit() {
    this.triedToReset = false;
    this.resetting = false;
    this.newPassword = '';
    this.resetText = 'Reset password';
    this.token = '';
    this.tokenExpired = false;

    this.setupPasswordValidator();

    this.route.paramMap.subscribe(params =>
      this.setToken(params.get('token')));
  }

  setToken(t: string) {
    this.tokenExpired = false;
    this.token = t;

    this.userService.resetPasswordValidateToken(this.token).pipe(
      catchError(this.errorService.handleError<any>('resetPasswordValidateToken', (e: any) => 
      {
        this.alertService.error('Invalid or expired token');
        this.tokenExpired = true;
      }))).subscribe(x => {
      });
  }

  ngOnDestroy(): void {
    this.validatePasswordSubscription.unsubscribe();
  }

  reset() {
    this.triedToReset = true;
    this.resetting = true;

    if (!this.valid()) {

      this.resetting = false;
    }

    this.userService.resetConfirmPassword(this.token, this.newPassword).subscribe(x => {
      if (!x.error) { 
        this.resetting = false;
        this.triedToReset = false;

        this.router.navigateByUrl('/login');

        this.alertService.success('Password changed successfully');
      }
    })
  }

  setupPasswordValidator() {
    const searchBox = document.getElementById('password');

    const typeahead = fromEvent(searchBox, 'input').pipe(
      map((e: KeyboardEvent) => (e.target as HTMLInputElement).value),
      filter(text => text.length > 1),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(() => this.userService.validatePassword(new User({password: this.newPassword})))
    );

    this.validatePasswordSubscription = typeahead.subscribe(data => {
      this.passwordValidations = data;
    });
  }

  valid(): boolean  {
    if (!this.newPassword || 0 == this.newPassword.trim().length) {
      return false;
    }

    if (this.passwordValidations && this.passwordValidations.length > 0) {
      return false;
    }

    return true;
  }
}