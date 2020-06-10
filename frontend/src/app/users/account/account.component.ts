import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/user';
import { AuthService } from 'src/app/auth.service';
import { UserService } from 'src/app/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitsService } from '../units.service';
import { UserBioData } from '../user-bio-data';
import { Unit, MeasurementType } from '../unit';
import { UserBioDataService } from '../user-bio-data.service';
import { AlertService } from 'src/app/alert/alert.service';
import { faCircleNotch, faSave, faKey, faTrash, faWeight, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

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
  units: Unit[];
  weightUnits: Unit[];
  heightUnits: Unit[];
  userBioDataVisible: boolean;

  faSave = faSave;
  faKey = faKey;
  faTrash = faTrash;
  faCircleNotch = faCircleNotch;
  faWeight = faWeight;
  faCheck = faCheck;
  faTimes = faTimes;

  loading: boolean = false;
  saving: boolean = false;
  deleting: boolean = false;

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
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params =>
      this.loadUserData(params.get('username')));
  }

  loadUserData(username: string) {
    this.username = username;
    this.userBioData = null;
    this.bioDataDate = new Date();
    this.weightUnits = [];
    this.heightUnits = [];
    this.loadUnits();
    this.deleteModalVisible = false;
    this.passwordModalVisible = false;
    this.allowed = this.authService.isCurrentUserLoggedIn(this.username);
    this.triedToSave = false;

    if (this.allowed) {
      this.loading = true;
      this.userService.get(this.username).subscribe(users => {
        if (users && users.length == 1) {
          this.user = users[0];

          this.userService.getEmail().subscribe(email => {
            this.user.email = email;
            this.loading = false;
          } );
        }
        else {
          this.loading = false;
        }
      });
    }
  }

  loadUnits(): void {
    this.unitsService.getUnits().subscribe(units => {
      this.units = units;
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
      this.alertService.warn('Please fill all required fields and try again');
      return;
    }

    if (this.user.system) {
      const unit = this.weightUnits.filter(x => x.system == this.user.system)[0];

      if (unit) {
        this.user.default_weight_unit = unit.id;
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

    this.saving = true;

    this.userService.update(this.user)
    .subscribe(() => {
      if (this.userBioData) {
        this.userBioDataService.saveUserBioData(this.userBioData).subscribe(() => this.saving = false);
      }
      else {
        this.saving = false;
      }
    });

    this.authService.setUnitSystem(this.user.system);

    this.router.navigateByUrl(`/users/${this.user.username}/profile`);
  }

  delete(): void {
    this.deleting = true;
    this.userService.delete(this.user).subscribe(x => {
      this.authService.logout().subscribe(x => {
        this.deleting = false;
        this.router.navigateByUrl('/');
      });
    });
  }

  valid(): boolean {
    if (!this.user.username || 0 == this.user.username.trim().length ||
      !this.user.email || 0 == this.user.email.trim().length) {
      return false;
    }

    if (!this.user.system) {
      return false;
    }

    return true;
  }
}
