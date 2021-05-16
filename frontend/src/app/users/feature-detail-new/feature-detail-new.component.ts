import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faSave, faTrash, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { CordovaService } from 'src/app/cordova.service';
import { SerializerUtilsService } from 'src/app/serializer-utils.service';
import { Tier } from 'src/app/user';
import { environment } from 'src/environments/environment';
import { Feature } from '../feature';
import { FeatureImage } from '../feature-image';
import { FeaturesService } from '../features.service';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-feature-detail-new',
  templateUrl: './feature-detail-new.component.html',
  styleUrls: ['./feature-detail-new.component.css']
})
export class FeatureDetailEditComponent implements OnInit, AfterViewInit, OnDestroy {
  feature: Feature;
  triedToSave: boolean;
  deleteModalVisible: boolean = false;
  userIsOwner: boolean = false;

  loading: boolean = false;
  saving: boolean = false;
  deleting: boolean = false;

  Tier = Tier;

  faSave = faSave;
  faTrash = faTrash;
  faCircleNotch = faCircleNotch;

  currentImageUrl = null;
  featureImageIndex = 0;
  featureImages: string[] = [];
  imageUploading = false;

  pausedSubscription: Subscription;
  refreshExpiredSubscription: Subscription;

  notFound: boolean = false;
  refreshExpired: boolean = false;

  userCanCreateFeatures: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private service: FeaturesService,
    private authService: AuthService,
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
      this.loadOrInitializeFeature(params.get('id')));

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
    localStorage.removeItem('state_feature_has_state');
    localStorage.removeItem('state_feature_detail_feature');
    this.serializerUtils.removeScrollPosition();
  }

  serialize() {
    localStorage.setItem('state_feature_has_state', JSON.stringify(true));
    localStorage.setItem('state_feature_detail_feature', JSON.stringify(this.feature));
    this.serializerUtils.serializeScrollPosition();
  }

  restore(): boolean {
    const hasState = JSON.parse(localStorage.getItem('state_feature_has_state'));

    if (!hasState) {
      return false;
    }

    const stateMeasurement = localStorage.getItem('state_feature_detail_feature');

    this.feature = this.service.getProperlyTypedFeature(JSON.parse(stateMeasurement));

    if (this.feature.id && this.feature.id > 0) {
      this.userIsOwner = this.feature.user && this.authService.isCurrentUserLoggedIn(this.feature.user.username);
    }
    else {
      this.userIsOwner = true;
    }

    return true;
  }

  private loadOrInitializeFeature(id: string): void {
    if (this.restore()) {
      return;
    }

    this.notFound = false;
    this.userIsOwner = false;
    this.refreshExpired = false;

    this.userCanCreateFeatures = true;

    if (id) {
      this.loading = true;
      this.loadingService.load();
      this.service.getFeature(id).subscribe(feature => {
        if (feature != null) {
          this.feature = feature;
          this.feature.feature_images = !this.feature.feature_images ? [] : this.feature.feature_images;
          this.userIsOwner = this.feature.user && this.authService.isCurrentUserLoggedIn(this.feature.user.username);
        }
        else {
          this.notFound = true;
        }

        this.loading = false;
        this.loadingService.unload();
      });
    } else {
      this.feature = new Feature();
      this.feature.feature_images = [];
      // this.feature.date = new Date();
      this.userIsOwner = true;
    }
  }

  save() {
    this.triedToSave = true;

    if (!this.service.valid(this.feature)) {
      // this.alertService.warn('Please fill all required fields and try again');
      return;
    }

    this.saveFeature();
  }

  saveFeature() {
    this.saving = true;

    this.service.saveFeature(this.feature).subscribe(feature => {
      this.triedToSave = false;
      this.saving = false;

      if (feature && feature.id) {
        this.navigateToList();
      }
    });
  }

  delete() {
    this.hideDeleteModal();

    this.deleting = true;
    this.service.deleteFeature(this.feature).subscribe(e => {
      if (e == null) {
        this.deleting = false;
        this.navigateToList();
      }
    });
  }

  navigateToList() {
    this.router.navigate(['/users', this.authService.getUsername(), 'features'], {
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
    if (this.feature &&
      this.feature.id &&
      this.authService.isCurrentUserLoggedIn(this.feature.user.username)) {
      return true;
    }

    return false;
  }

  showSaveButton() {
    if (!this.feature || !this.feature.id || this.feature.id <= 0) {
      return true;
    }

    return this.showDeleteButton();
  }


  getImageUrl(url: string) {
    return environment.mediaUrl + url;
  }

  selectCurrentImage() {
    if (this.feature.feature_images && this.feature.feature_images.length > this.featureImageIndex) {
      this.currentImageUrl = this.getImageUrl(this.feature.feature_images[this.featureImageIndex].url);
    }
  }

  addImage(url: string) {
    this.feature.feature_images.push(new FeatureImage(url));

    this.featureImageIndex = 0;
    this.selectCurrentImage();
  }

  deleteImage(url: string) {
    this.feature.feature_images = this.feature.feature_images.filter(p => p.url != url);
    // this.featureImages = this.feature.feature_images.map(p => p.url);

    this.featureImageIndex = 0;
    this.selectCurrentImage();
  }

  uploadingInProgress() {
    this.imageUploading = true;
  }

  stoppedUploading() {
    this.imageUploading = false;
  }
}
