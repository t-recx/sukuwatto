import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { faBalanceScale, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
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

  environmentTypeLabel: string;

  environment = environment;

  faCircleNotch = faCircleNotch;
  faBalanceScale = faBalanceScale;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.user = new User();
    this.loggingIn = false;
  }

  login(): void {
    this.triedToLogin = true;
    if (!this.user.username || 0 == this.user.username.trim().length ||
      !this.user.password || 0 == this.user.password.trim().length) {
      return;
    }

    this.loggingIn = true;

    let username = null;
    let password = this.user.password;

    username = this.user.username.trim();

    this.authService.login(username, password)
      .subscribe(token => {
        if (this.authService.isLoggedIn()) {
          let redirect = this.authService.redirectUrl;

          if (!redirect || redirect.length == 0 ||
            redirect == '/login' || redirect == '/login/') {
            redirect = `/users/${this.authService.getUsername()}`;
          }

          this.authService.redirectUrl = null;

          this.router.navigateByUrl(redirect);
        }
        else {
          this.loggingIn = false;
        }
      });
  }
}
