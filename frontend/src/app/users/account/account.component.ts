import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/user';
import { AuthService } from 'src/app/auth.service';
import { UserService } from 'src/app/user.service';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  user: User;
  username: string;
  allowed: boolean;
  triedToSave: boolean;
  deleteModalVisible: boolean;
  passwordModalVisible: boolean;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertService: AlertService,
    public route: ActivatedRoute, 
  ) { }

  ngOnInit() {
    this.deleteModalVisible = false;
    this.passwordModalVisible = false;
    this.username = this.route.snapshot.paramMap.get('username');
    this.allowed = this.authService.isLoggedIn() && this.authService.username == this.username;
    this.triedToSave = false;

    if (this.allowed) {
      this.userService.get(this.username).subscribe(users => {
        if (users && users.length == 1) {
          this.user = users[0];
        }
      });
    }
  }

  showDeleteModal(): void {
    this.deleteModalVisible = true;
  }

  hideDeleteModal(): void {
    this.deleteModalVisible = false;
  }

  showPasswordModal(): void {
    this.passwordModalVisible = true;
  }

  hidePasswordModal(): void {
    this.passwordModalVisible = false;
  }

  save(): void {
    this.triedToSave = true;

    if (!this.valid()) {
      return;
    }

    this.userService.update(this.user)
    .subscribe();

    // todo: add change password functionality

    // todo: redirect to profile 
  }

  delete(): void {
    // todo
  }

  valid(): boolean {
    if (!this.user.username || 0 == this.user.username.trim().length ||
      !this.user.email || 0 == this.user.email.trim().length) {
      return false;
    }

    return true;
  }
}
