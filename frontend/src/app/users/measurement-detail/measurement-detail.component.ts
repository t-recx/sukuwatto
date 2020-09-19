import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faSave, faTrash, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/alert/alert.service';
import { AuthService } from 'src/app/auth.service';
import { CordovaService } from 'src/app/cordova.service';
import { SerializerUtilsService } from 'src/app/serializer-utils.service';
import { ExercisesService } from '../exercises.service';
import { LoadingService } from '../loading.service';
import { UserBioData } from '../user-bio-data';
import { UserBioDataService } from '../user-bio-data.service';

@Component({
  selector: 'app-measurement-detail',
  templateUrl: './measurement-detail.component.html',
  styleUrls: ['./measurement-detail.component.css']
})
export class MeasurementDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  userBioData: UserBioData;
  triedToSave: boolean;
  deleteModalVisible: boolean = false;
  userIsOwner: boolean = false;

  loading: boolean = false;
  saving: boolean = false;
  deleting: boolean = false;

  faSave = faSave;
  faTrash = faTrash;
  faCircleNotch = faCircleNotch;

  pausedSubscription: Subscription;

  notFound: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private service: UserBioDataService,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
    private loadingService: LoadingService,
    private cordovaService: CordovaService,
    private serializerUtils: SerializerUtilsService,
  ) { }

  ngAfterViewInit(): void {
    this.serializerUtils.restoreScrollPosition();
  }

  ngOnInit() {
    this.triedToSave = false;

    this.route.paramMap.subscribe(params =>
      this.loadOrInitializeUserBioData(params.get('id')));

    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.serialize()) ;
  }

  ngOnDestroy(): void {
    this.pausedSubscription.unsubscribe();

    this.serializerUtils.removeScrollPosition();
  }

  serialize() {
    localStorage.setItem('state_measurement_has_state', JSON.stringify(true));
    localStorage.setItem('state_measurement_detail_measurement', JSON.stringify(this.userBioData));
    this.serializerUtils.serializeScrollPosition();
  }

  restore(): boolean {
    const hasState = JSON.parse(localStorage.getItem('state_measurement_has_state'));

    if (!hasState) {
      return false;
    }

    const stateMeasurement = localStorage.getItem('state_measurement_detail_measurement');

    this.userBioData = this.service.getProperlyTypedUserBioData(JSON.parse(stateMeasurement));

    if (this.userBioData.id && this.userBioData.id > 0) {
      this.userIsOwner = this.userBioData.user && this.authService.isCurrentUserLoggedIn(this.userBioData.user.username);
    }
    else {
      this.userIsOwner = true;
    }

    return true;
  }

  private loadOrInitializeUserBioData(id: string): void {
    if (this.restore()) {
      return;
    }

    this.notFound = false;
    this.userIsOwner = false;

    if (id) {
      this.loading = true;
      this.loadingService.load();
      this.service.getUserBioData(id).subscribe(userBioData => {
        if (userBioData != null) {
          this.userBioData = userBioData;
          this.userIsOwner = this.userBioData.user && this.authService.isCurrentUserLoggedIn(this.userBioData.user.username);
        }
        else {
          this.notFound = true;
        }

        this.loading = false;
        this.loadingService.unload();
      });
    } else {
      this.userBioData = new UserBioData();
      this.userBioData.date = new Date();
      this.userBioData.visibility = this.authService.getUserDefaultMeasurementVisibility();
      this.userIsOwner = true;
    }
  }

  save() {
    this.triedToSave = true;

    if (!this.service.valid(this.userBioData)) {
      this.alertService.warn('Please fill all required fields and try again');
      return;
    }

    this.saveUserBioData();
  }

  saveUserBioData() {
    this.saving = true;

    this.service.saveUserBioData(this.userBioData).subscribe(userBioData => {
      this.triedToSave = false;
      this.saving = false;

      if (userBioData && userBioData.id) {
        this.navigateToList();
      }
    });
  }

  delete() {
    this.hideDeleteModal();

    this.deleting = true;
    this.service.deleteUserBioData(this.userBioData).subscribe(e => {
      this.deleting = false;
      this.navigateToList();
    });
  }

  navigateToList() {
    this.router.navigate(['/users', this.authService.getUsername(), 'measurements'], {
      relativeTo: this.route,
    });
  }

  showDeleteModal() {
    this.deleteModalVisible = true;
  }

  hideDeleteModal() {
    this.deleteModalVisible = false;
  }

  showDeleteButton() {
    if (this.userBioData &&
      this.userBioData.id &&
      this.authService.isCurrentUserLoggedIn(this.userBioData.user.username)) {
      return true;
    }

    return false;
  }

  showSaveButton() {
    if (!this.userBioData || !this.userBioData.id || this.userBioData.id <= 0) {
      return true;
    }

    return this.showDeleteButton();
  }

}
