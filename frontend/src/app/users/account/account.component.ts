import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/user';
import { AuthService } from 'src/app/auth.service';
import { UserService } from 'src/app/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitsService } from '../units.service';
import { UserBioData } from '../user-bio-data';
import { Unit, MeasurementType } from '../unit';
import { UserBioDataService } from '../user-bio-data.service';
// todo: add change password functionality

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
  userBioData: UserBioData;
  bioDataDate: Date;
  weightUnits: Unit[];
  heightUnits: Unit[];
  userBioDataVisible: boolean;

  setProfilePicture(event: any) {
    this.user.profile_filename = event;
  }

  onUserBioDataClosed() {
    this.userBioDataVisible = false;
  }

  onUserBioDataOkayed(event: any) {
    this.userBioData = event;
  }

  constructor(
    private authService: AuthService,
    private userService: UserService,
    public route: ActivatedRoute, 
    private router: Router,
    private unitsService: UnitsService,
    private userBioDataService: UserBioDataService,
  ) { }

  ngOnInit() {
    this.userBioData = null;
    this.bioDataDate = new Date();
    this.weightUnits = [];
    this.heightUnits = [];
    this.loadUnits();
    this.deleteModalVisible = false;
    this.passwordModalVisible = false;
    this.username = this.route.snapshot.paramMap.get('username');
    this.allowed = this.authService.isLoggedIn() && this.authService.getUsername() == this.username;
    this.triedToSave = false;

    if (this.allowed) {
      this.userService.get(this.username).subscribe(users => {
        if (users && users.length == 1) {
          this.user = users[0];
        }
      });
    }
  }

  loadUnits(): void {
    this.unitsService.getUnits().subscribe(units => {
      this.weightUnits = units.filter(u => u.measurement_type == MeasurementType.Weight);
      this.heightUnits = units.filter(u => u.measurement_type == MeasurementType.Height);
    });

  }
  
  showUserBioData(): void {
    this.userBioDataVisible = true;
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

    if (this.userBioData) {
      this.userBioDataService.saveUserBioData(this.userBioData).subscribe();
    }

    this.router.navigateByUrl(`/users/${this.user.username}/profile`);
  }

  delete(): void {
    this.userService.delete(this.user).subscribe(x => {
      this.authService.logout();

      this.router.navigateByUrl('/');
    });
  }

  valid(): boolean {
    if (!this.user.username || 0 == this.user.username.trim().length ||
      !this.user.email || 0 == this.user.email.trim().length) {
      return false;
    }

    return true;
  }
}
