import { Component, OnInit,OnDestroy } from '@angular/core';
import { UserService } from '../user.service';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-reset-password-request',
  templateUrl: './reset-password-request.component.html',
  styleUrls: ['./reset-password-request.component.css']
})
export class ResetPasswordRequestComponent implements OnInit {

  triedToReset: boolean;
  resetting: boolean;
  resetText: string;

  resetEmail: string = '';

  constructor(
    private userService: UserService,
    private alertService: AlertService,
  ) { 

  }

  ngOnInit() {
    this.triedToReset = false;
    this.resetting = false;
    this.resetEmail = '';
    this.resetText = 'Send reset password e-mail';
  }

  reset() {
    this.triedToReset = true;
    this.resetting = true;

    if (!this.valid()) {

      this.resetting = false;
    }

    this.userService.resetPassword(this.resetEmail).subscribe(x => {
      this.resetting = false;
      this.triedToReset = false;

      if (!x.error) {
        this.alertService.success('Instructions to reset your password were sent to your e-mail account');
      }
    })
  }

  valid(): boolean  {
    if (!this.resetEmail || 0 == this.resetEmail.trim().length) {
      return false;
    }

    return true;
  }
}
