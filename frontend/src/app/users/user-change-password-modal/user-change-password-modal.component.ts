import { Component, OnInit, Output, Input, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { UserChangePassword } from '../user-change-password';
import { UserService } from 'src/app/user.service';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-user-change-password-modal',
  templateUrl: './user-change-password-modal.component.html',
  styleUrls: ['./user-change-password-modal.component.css']
})
export class UserChangePasswordComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Output() closed = new EventEmitter();

  triedToSave: boolean = false;

  old_password_error: string;
  new_password_error: string;
  confirm_password_error: string;

  model_old_password: string = '';
  model_new_password: string = '';
  model_confirm_password: string = '';

  constructor(private userService: UserService,
    private alertService: AlertService) { 

    }

  resetErrors() {
      this.old_password_error = null;
      this.new_password_error = null;
      this.confirm_password_error = null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ("visible" in changes) {
      this.triedToSave = false;
      this.resetErrors();
      this.model_old_password = '';
      this.model_new_password = '';
      this.model_confirm_password = '';
    }
  }

  ngOnInit() {
  }

  change() {
    this.triedToSave = true;
    if (this.valid()) {
      this.userService.changePassword(this.model_old_password,
        this.model_new_password)
        .pipe(
          catchError(
            (error: HttpErrorResponse)  => {
              if (error.status == 400 && error.error && error.error.length > 0) {
                if (error.error[0] == 'Wrong password specified') {
                  this.old_password_error = error.error[0];
                }
                else {
                  this.new_password_error = error.error[0];
                }
              }
              else {
                this.alertService.error('Unable to change password');
              }

              throw error;
            }
           )
        )
        .subscribe(x => {
          this.alertService.success('Password changed successfully');
          this.hide();
        });
    }
  }

  hide() {
    this.closed.emit();
  }

  valid(): boolean {
    this.resetErrors();
    if (this.model_old_password.length == 0 ||
      this.model_new_password.length == 0 ||
      this.model_confirm_password.length == 0) {
      return false;
    }
    else if (this.model_new_password != this.model_confirm_password) {
      this.confirm_password_error = "Passwords don't match";
      return false;
    }

    return true;
  }
}
