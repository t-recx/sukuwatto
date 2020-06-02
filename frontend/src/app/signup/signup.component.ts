import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../user';
import { UserService } from '../user.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { filter, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { UnitsService } from '../users/units.service';
import { Unit, MeasurementType } from '../users/unit';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  user: User;
  signingUp: boolean;
  triedToSignUp: boolean;
  signUpText: string;
  validatePasswordSubscription: Subscription;
  passwordValidations: string[];
  units: Unit[];
  acceptedTerms: boolean = false;

  faCircleNotch = faCircleNotch;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private unitsService: UnitsService,
    private router: Router,
    ) { }

  ngOnInit() {
    this.user = new User();
    this.triedToSignUp = false;
    this.acceptedTerms = false;
    this.signingUp = false;
    this.signUpText = "Sign up";
    this.unitsService.getUnits().subscribe(u => this.units = u);

    this.setupPasswordValidator();
  }

  ngOnDestroy(): void {
    this.validatePasswordSubscription.unsubscribe();
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
      const unit = this.units.filter(x => x.measurement_type == MeasurementType.Weight && 
        x.system == this.user.system)[0];

      if (unit) {
        this.user.default_weight_unit = unit.id;
      }
    }


    if (this.passwordValidations && this.passwordValidations.length > 0) {
      return;
    }

    this.signingUp = true;
    this.signUpText = "Signing up...";

    this.userService.create(this.user)
      .subscribe(user => {
        if (user) {
          this.authService.login(this.user)
            .subscribe(token => {
              if (this.authService.isLoggedIn()) {
                let redirect = this.authService.redirectUrl ?
                  this.router.parseUrl(this.authService.redirectUrl) : `/users/${this.user.username}/account`;

                this.signingUp = false;
                this.signUpText = "Sign up";
                this.router.navigateByUrl(redirect);
              }
            });
        }
      });
  }
}
