import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { UserService } from '../user.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  user: User;
  signingUp: boolean;
  triedToSignUp: boolean;
  signUpText: string;

  constructor(
    private userService: UserService,
    private authService: AuthService
    ) { }

  ngOnInit() {
    this.user = new User();
    this.triedToSignUp = false;
    this.signingUp = false;
    this.signUpText = "Sign up";
  }

  signUp() {
    this.triedToSignUp = true;
    if (!this.user.username || 0 == this.user.username.trim().length ||
      !this.user.password || 0 == this.user.password.trim().length ||
      !this.user.email || 0 == this.user.email.trim().length) {
      return;
    }

    this.signingUp = true;
    this.signUpText = "Signing up...";

    this.userService.create(this.user)
      .subscribe(user =>
        {
          if (user) {
            this.authService.login(this.user);
            // todo redirect to home or something
          }
        });

    this.signingUp = false;
    this.signUpText = "Sign up";
  }
}
