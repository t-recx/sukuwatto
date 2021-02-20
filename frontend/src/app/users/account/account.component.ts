import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/user';
import { AuthService } from 'src/app/auth.service';
import { UserService } from 'src/app/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitsService } from '../units.service';
import { Unit, MeasurementType } from '../unit';
import { AlertService } from 'src/app/alert/alert.service';
import { faCircleNotch, faSave, faKey, faTrash, faWeight, faCheck, faTimes, faDoorClosed, faFileArchive } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { CordovaService } from 'src/app/cordova.service';
import { SerializerUtilsService } from 'src/app/serializer-utils.service';
import { Subscription } from 'rxjs';
import { VisibilityLabel } from 'src/app/visibility';

export enum AccountTabType {
  General,
  Privacy,
  Perks
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit, OnDestroy, AfterViewInit {
  user: User;
  username: string;
  allowed: boolean;
  triedToSave: boolean;
  deleteModalVisible: boolean;
  alreadyProcessingDataRequest: boolean;
  passwordModalVisible: boolean;
  requestDataModalVisible: boolean;
  requestConfirmationModalVisible: boolean;
  bioDataDate: Date;
  units: Unit[];
  weightUnits: Unit[];
  heightUnits: Unit[];
  energyUnits: Unit[];

  perksTabVisible: boolean = false;

  selectedTabType: AccountTabType = AccountTabType.General;
  tabType = AccountTabType;

  selectTabType(tt: AccountTabType) {
    this.selectedTabType = tt;
  }

  forbidden: boolean = false;

  faSave = faSave;
  faKey = faKey;
  faTrash = faTrash;
  faCircleNotch = faCircleNotch;
  faWeight = faWeight;
  faCheck = faCheck;
  faTimes = faTimes;
  faDoorClosed = faDoorClosed;
  faFileArchive = faFileArchive;

  loading: boolean = false;
  saving: boolean = false;
  deleting: boolean = false;
  requesting: boolean = false;

  visibilityLabel = VisibilityLabel;

  pausedSubscription: Subscription;

  setProfilePicture(event: any) {
    this.user.profile_filename = event;
  }

  constructor(
    private authService: AuthService,
    private userService: UserService,
    public route: ActivatedRoute,
    private router: Router,
    private unitsService: UnitsService,
    private alertService: AlertService,
    private loadingService: LoadingService,
    private cordovaService: CordovaService,
    private serializerUtils: SerializerUtilsService,
  ) { }

  ngAfterViewInit(): void {
    this.serializerUtils.restoreScrollPosition();
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params =>
      this.loadUserData(params.get('username')));

    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.serialize());
  }

  ngOnDestroy(): void {
    this.pausedSubscription.unsubscribe();

    localStorage.removeItem('state_account_has_state');
    localStorage.removeItem('state_account_user');
    this.serializerUtils.removeScrollPosition();
  }

  serialize() {
    localStorage.setItem('state_account_has_state', JSON.stringify(true));
    localStorage.setItem('state_account_user', JSON.stringify(this.user));
    this.serializerUtils.serializeScrollPosition();
  }

  restore(): boolean {
    const hasState = JSON.parse(localStorage.getItem('state_account_has_state'));

    if (!hasState) {
      return false;
    }

    const stateUser = localStorage.getItem('state_account_user');

    this.user = JSON.parse(stateUser);

    return true;
  }

  customClassToggle() {
    if (!this.user.custom_class) {
      this.user.primary_class = this.user.primary_class_computed;
      this.user.secondary_class = this.user.secondary_class_computed;
    }
  }

  loadUserData(username: string) {
    this.forbidden = false;
    this.username = username;
    this.bioDataDate = new Date();
    this.weightUnits = [];
    this.heightUnits = [];
    this.energyUnits = [];
    this.loadUnits();
    this.deleteModalVisible = false;
    this.passwordModalVisible = false;
    this.requestDataModalVisible = false;
    this.alreadyProcessingDataRequest = false
    this.requestDataModalVisible = false;
    this.allowed = this.authService.isCurrentUserLoggedIn(this.username);
    this.forbidden = !this.allowed;
    this.triedToSave = false;
    this.perksTabVisible = false;

    if (this.allowed) {
      if (this.restore()) {
        return;
      }

      this.loading = true;
      this.loadingService.load();
      this.userService.getUser(this.username).subscribe(user => {
        if (user) {
          this.user = user;
          this.perksTabVisible = this.user.is_staff || this.user.tier == 'a';

          this.userService.getEmail().subscribe(email => {
            this.user.email = email;
            this.loading = false;
            this.loadingService.unload();
          });
        }
        else {
          this.loading = false;
          this.loadingService.unload();
        }
      });
    }
  }

  loadUnits(): void {
    this.unitsService.getUnits().subscribe(units => {
      this.units = units;
      this.weightUnits = units.filter(u => u.measurement_type == MeasurementType.Weight);
      this.heightUnits = units.filter(u => u.measurement_type == MeasurementType.Height);
      this.energyUnits = units.filter(u => u.measurement_type == MeasurementType.Energy);
    });

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
        this.saving = false;

        this.authService.setUnitSystem(this.user.system);
        this.authService.setUserDefaultWorkoutVisibility(this.user.default_visibility_workouts);
        this.authService.setUserDefaultMeasurementVisibility(this.user.default_visibility_user_bio_datas);
        this.authService.setUserEnergyUnitId(this.user.default_energy_unit ? this.user.default_energy_unit.toString() : null);

        this.router.navigateByUrl(`/users/${this.user.username}/profile`);
      });
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

  requestPersonalData() {
    this.hideRequestConfirmationModal();

    this.userService.requestPersonalData().subscribe(res => {
      if (res && res.status) {
        if (res.status === 202) {
          this.alreadyProcessingDataRequest = true;
          this.requestDataModalVisible = true;
        }
        else if (res.status === 201) {
          this.alreadyProcessingDataRequest = false;
          this.requestDataModalVisible = true;
        }
      }
    });
  }

  confirmRequestPersonalData() {
    this.requestConfirmationModalVisible = true;
  }

  hideRequestDataModal() {
    this.requestDataModalVisible = false;
  }

  hideRequestConfirmationModal() {
    this.requestConfirmationModalVisible = false;
  }
}
