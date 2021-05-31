import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../user';
import { UserService } from '../user.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { filter, map, debounceTime, distinctUntilChanged, switchMap, catchError, first } from 'rxjs/operators';
import { UnitsService } from '../users/units.service';
import { Unit, MeasurementType } from '../users/unit';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { UserRegistration } from '../users/user-registration';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  user: UserRegistration;
  signingUp: boolean;
  triedToSignUp: boolean;
  validatePasswordSubscription: Subscription;
  passwordValidations: string[];
  units: Unit[];
  acceptedTerms: boolean = false;
  usernameError: string = null;
  emailError: string = null;
  captchaSolved: boolean = false;
  captchaResponse: string = null;

  faCircleNotch = faCircleNotch;
  userLoadedSubscription: Subscription;

  constructor(
    private errorService: ErrorService,
    private alertService: AlertService,
    private userService: UserService,
    private authService: AuthService,
    private unitsService: UnitsService,
    private router: Router,
    ) { 
    }

  ngOnInit() {
    this.user = new UserRegistration();
    this.triedToSignUp = false;
    this.acceptedTerms = false;
    this.signingUp = false;
    this.usernameError = null;
    this.unitsService.getUnits().subscribe(u => this.units = u);

    this.setupPasswordValidator();
  }

  ngOnDestroy(): void {
    if (this.validatePasswordSubscription) {
      this.validatePasswordSubscription.unsubscribe();
    }

    if (this.userLoadedSubscription) {
      this.userLoadedSubscription.unsubscribe();
    }
  }

  toggleAcceptTerms(): void {
    this.acceptedTerms = !this.acceptedTerms;
  }

  setupPasswordValidator() {
    const searchBox = document.getElementById('password');

    const typeahead = fromEvent(searchBox, 'input').pipe(
      map((e: KeyboardEvent) => (e.target as HTMLInputElement).value),
      filter(text => text.length > 1),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(() => this.userService.validatePassword(this.user))
    );

    this.validatePasswordSubscription = typeahead.subscribe(data => {
      this.passwordValidations = data;
    });
  }

  signUp() {
    this.triedToSignUp = true;
    if (!this.user.username || 0 == this.user.username.trim().length ||
      !this.user.password || 0 == this.user.password.trim().length ||
      !this.user.email || 0 == this.user.email.trim().length) {
      return;
    }

    if (!this.user.system) {
      return false;
    }
    else {
      const weightUnit = this.units.filter(x => x.measurement_type == MeasurementType.Weight && 
        x.system == this.user.system)[0];

      if (weightUnit) {
        this.user.default_weight_unit = weightUnit.id;
      }

      const speedUnit = this.units.filter(x => x.measurement_type == MeasurementType.Speed && 
        x.system == this.user.system)[0];

      if (speedUnit) {
        this.user.default_speed_unit = speedUnit.id;
      }

      const distanceUnit = this.units.filter(x => x.measurement_type == MeasurementType.Distance && 
        x.system == this.user.system)[0];

      if (distanceUnit) {
        this.user.default_distance_unit = distanceUnit.id;
      }
    }


    if (this.passwordValidations && this.passwordValidations.length > 0) {
      return;
    }

    this.signingUp = true;

    this.usernameError = null;
    this.emailError = null;
    this.user.username = this.user.username.trim();
    this.user.email = this.user.email.trim();

    this.user.recaptcha = this.captchaResponse;

    this.setupRedirectToAccount();
    this.userService.create(this.user)
      .pipe(
        catchError(this.errorService.handleError<User>('create', (e: any) => 
        {
          if (e.error && e.error.username) {
            this.usernameError = e.error.username.toString();
          }
          else if (e.error && e.error.email) {
            this.emailError = e.error.email.toString();
          }
          else {
            this.alertService.error('Unable to sign up, try again later');
          }

          grecaptcha.reset();
        }))
      )
      .subscribe(user => {
        if (user) {
          this.authService.login(this.user.username, this.user.password)
            .subscribe(token => {
              if (token == null) {
                if (this.userLoadedSubscription) {
                  this.userLoadedSubscription.unsubscribe();
                }

                this.signingUp = false;
                this.router.navigateByUrl('/login');
                this.alertService.error('Unable to sign in, try again later');
              }
            });
        }
        else {
          this.signingUp = false;
        }
      });
  }

  setupRedirectToAccount() {
    if (this.userLoadedSubscription) {
      this.userLoadedSubscription.unsubscribe();
    }

    this.userLoadedSubscription = this.authService.userLoaded.pipe(first())
    .subscribe(user => {
      if (this.signingUp) {
        if (this.authService.isCurrentUserLoggedIn(this.user.username)) {
          // const redirect = this.authService.redirectUrl ?
          //   this.router.parseUrl(this.authService.redirectUrl) : `/users/${this.user.username}/account`;
          const redirect = `/users/${this.user.username}/account`;

          this.signingUp = false;
          this.router.navigateByUrl(redirect);
        }
      }
    });
  }

  resolvedCaptcha(response: string) {
    this.captchaResponse = response;
    this.captchaSolved = response != null;
  }
}
