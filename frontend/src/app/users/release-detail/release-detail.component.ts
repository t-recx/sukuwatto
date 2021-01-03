import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faSave, faTrash, faCircleNotch, faCode } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertService } from 'src/app/alert/alert.service';
import { AuthService } from 'src/app/auth.service';
import { CordovaService } from 'src/app/cordova.service';
import { ErrorService } from 'src/app/error.service';
import { SerializerUtilsService } from 'src/app/serializer-utils.service';
import { Feature } from '../feature';
import { LoadingService } from '../loading.service';
import { Release, ReleaseStateLabel } from '../release';
import { ReleasesService } from '../releases.service';

@Component({
  selector: 'app-release-detail',
  templateUrl: './release-detail.component.html',
  styleUrls: ['./release-detail.component.css']
})
export class ReleaseDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  release: Release;
  triedToSave: boolean;
  deleteModalVisible: boolean = false;
  userIsStaff: boolean = false;
  forbidden: boolean = false;

  loading: boolean = false;
  saving: boolean = false;
  deleting: boolean = false;

  faSave = faSave;
  faTrash = faTrash;
  faCircleNotch = faCircleNotch;
  faCode = faCode;

  pausedSubscription: Subscription;
  refreshExpiredSubscription: Subscription;

  stateLabel = ReleaseStateLabel;

  featureSelectionVisible = false;

  notFound: boolean = false;
  refreshExpired: boolean = false;

  constructor(
    private errorService: ErrorService,
    private route: ActivatedRoute,
    private service: ReleasesService,
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
    this.refreshExpired = false;

    this.route.paramMap.subscribe(params =>
      this.loadOrInitializeRelease(params.get('id')));

    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.serialize()) ;
    this.refreshExpiredSubscription = this.authService.refreshExpired.subscribe(x => {
      this.serialize();
      this.refreshExpired = true;
    });
  }

  ngOnDestroy(): void {
    this.pausedSubscription.unsubscribe();
    this.refreshExpiredSubscription.unsubscribe();

    if (!this.refreshExpired) {
      this.removeSerialization();
    }
    this.refreshExpired = false;
  }

  private removeSerialization() {
    localStorage.removeItem('state_release_has_state');
    localStorage.removeItem('state_release_detail_release');
    this.serializerUtils.removeScrollPosition();
  }

  serialize() {
    localStorage.setItem('state_release_has_state', JSON.stringify(true));
    localStorage.setItem('state_release_detail_release', JSON.stringify(this.release));
    this.serializerUtils.serializeScrollPosition();
  }

  restore(): boolean {
    const hasState = JSON.parse(localStorage.getItem('state_release_has_state'));

    if (!hasState) {
      return false;
    }

    const stateRelease = localStorage.getItem('state_release_detail_release');

    this.release = this.service.getProperlyTypedRelease(JSON.parse(stateRelease));

    this.userIsStaff = this.authService.userIsStaff();

    return true;
  }

  private loadOrInitializeRelease(id: string): void {
    if (this.restore()) {
      return;
    }

    this.forbidden = false;
    this.notFound = false;
    this.userIsStaff = this.authService.userIsStaff();
    this.refreshExpired = false;

    if (id) {
      this.loading = true;
      this.loadingService.load();
      this.service.getRelease(id).subscribe(release => {
        if (release != null) {
          this.release = release;

          this.userIsStaff = this.authService.userIsStaff();
        }
        else {
          this.notFound = true;
        }

        this.loading = false;
        this.loadingService.unload();
      });
    } else {
      this.release = new Release();

      if (!this.userIsStaff) {
        this.forbidden = true;
      }
    }
  }

  save() {
    this.triedToSave = true;

    if (!this.service.valid(this.release)) {
      this.alertService.warn('Please fill all required fields and try again');
      return;
    }

    this.saveRelease();
  }

  saveRelease() {
    this.saving = true;

    this.service.saveRelease(this.release)
    .pipe(
      catchError(this.errorService.handleError<Release>('getPlans', (e: any) =>
            {
              if (e.status && e.status == 403)  {
                this.forbidden = true;
              }
              else {
                this.alertService.error('Unable to save release');
              }
            }, null))
    )
    .subscribe(release => {
      if (release) {
        this.triedToSave = false;
        this.saving = false;

        if (release && release.id) {
          this.navigateToList();
        }
      }
    });
  }

  delete() {
    this.hideDeleteModal();

    this.deleting = true;
    this.service.deleteRelease(this.release).subscribe(e => {
      this.deleting = false;
      this.navigateToList();
    });
  }

  navigateToList() {
    this.router.navigate(['/users', this.authService.getUsername(), 'releases'], {
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
    if (this.release &&
      this.release.id &&
      this.userIsStaff) {
      return true;
    }

    return false;
  }

  showSaveButton() {
    if (!this.release || !this.release.id || this.release.id <= 0) {
      return true;
    }

    return this.showDeleteButton();
  }

  setReleaseDeployDate(event: any) {
    if (event && this.release) {
      this.release.deploy_date = new Date(event);
    }
  }

  removeFeature(feature: Feature) {
    this.release.features = this.release.features.filter(x => x != feature);
  }

  showFeatureSelection() {
    this.featureSelectionVisible = true;
  }

  modalClosed() {
    this.featureSelectionVisible = false;
  }

  addFeature(feature) {
    this.release.features.push(feature);
  }
}
