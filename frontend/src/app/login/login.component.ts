import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';

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

  environmentTypeLabel: string;

  faCircleNotch = faCircleNotch;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.user = new User();
    this.loggingIn = false;
    this.signInText = "Sign in"; 

    this.environmentTypeLabel = environment.application ? 'app' : 'website';
  }

  login(): void {
    this.triedToLogin = true;
    if (!this.user.username || 0 == this.user.username.trim().length ||
      !this.user.password || 0 == this.user.password.trim().length) {
      return;
    }

    this.loggingIn = true;
    this.signInText = "Signing in...";

    let username = null;
    let email = null;
    let password = this.user.password;

    if (this.user.username.includes('@') && this.user.username.includes('.')) {
      email = this.user.username;
    }
    else {
      username = this.user.username;
    }

    this.authService.login(username, email, password)
      .subscribe(token => {
        if (this.authService.isLoggedIn()) {
          let redirect = this.authService.redirectUrl ? 
            this.router.parseUrl(this.authService.redirectUrl) : `/users/${this.authService.getUsername()}`; 

          this.authService.redirectUrl = null;
          this.router.navigateByUrl(redirect);
        }
        else {
          this.loggingIn = false;
          this.signInText = "Sign in";
        }
      });
  }
}
