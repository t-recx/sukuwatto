import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { AuthService } from '../auth.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: User;
  loggingIn: boolean;
  triedToLogin: boolean;
  signInText: string;

  constructor(
    private authService: AuthService,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit() {
    this.user = new User();
    this.loggingIn = false;
    this.signInText = "Sign in"; 
  }

  login(): void {
    this.triedToLogin = true;
    if (!this.user.username || 0 == this.user.username.trim().length ||
      !this.user.password || 0 == this.user.password.trim().length) {
      return;
    }

    this.loggingIn = true;
    this.signInText = "Signing in...";

    this.authService.login(this.user)
      .subscribe(token => {
        if (this.authService.isLoggedIn()) {
          let redirect = this.authService.redirectUrl ? 
            this.router.parseUrl(this.authService.redirectUrl) : '/user/home';

          this.router.navigateByUrl(redirect);
        }
        else {
          this.loggingIn = false;
          this.signInText = "Sign in";
        }
      });
  }
}
