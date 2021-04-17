import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { Feature, FeatureState } from '../feature';
import { FeaturesService } from '../features.service';
import { AuthService } from 'src/app/auth.service';
import { faStickyNote, faCircleNotch, faCheck, faTimes, faChevronLeft, faChevronRight, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { TimeService } from '../time.service';
import { environment } from 'src/environments/environment';
import { FeatureImage } from '../feature-image';

@Component({
  selector: 'app-feature-detail-card',
  templateUrl: './feature-detail-card.component.html',
  styleUrls: ['./feature-detail-card.component.css']
})
export class FeatureDetailCardComponent implements OnInit {
  @Input() id: number;
  @Input() feature: Feature = null;
  @Input() detailView: boolean = true;
  @Input() canNavigate: boolean = true;
  @Input() commentsSectionOpen: boolean = false;
  @Input() showCancelButton: boolean = false;
  @Output() deleted = new EventEmitter();
  @Output() cancelled = new EventEmitter();
  @Output() selected = new EventEmitter();

  @ViewChild('previousOverlay') previousOverlay: ElementRef;
  @ViewChild('nextOverlay') nextOverlay: ElementRef;

  faStickyNote = faStickyNote;
  faCircleNotch = faCircleNotch;
  faCheck = faCheck;
  faTimes = faTimes;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faLock = faLock;
  faLockOpen = faLockOpen;

  imageUploading = false;

  authenticatedUserIsOwner: boolean = false;
  userIsStaff: boolean = false;

  updating: boolean = false;
  toggling: boolean = false;

  deleteModalVisible: boolean = false;

  editing: boolean = false;

  triedToSave: boolean = false;

  routerLink: any;
  shareTitle: string;
  shareLink: string;

  currentImageUrl = null;
  featureImageIndex = 0;
  featureImages: string[] = [];

  constructor(
    private featuresService: FeaturesService,
    private authService: AuthService,
    private router: Router,
    private timeService: TimeService,
    ) { }

  ngOnInit() {
    if (!this.feature && this.id) {
      this.featuresService.getFeature(this.id).subscribe(p => { 
        this.setupFeature(p);
      });
    }
    else {
      this.setupFeature(this.feature);
    }
  }

  private setupFeature(p: Feature) {
    this.feature = p;
    if (this.feature) {
      this.featureImages = !this.feature.feature_images ? [] : this.feature.feature_images.map(u => u.url);
      this.selectCurrentImage();
      this.checkOwner();
      this.routerLink = ['/users', this.feature.user.username, 'feature', this.feature.id];
      this.shareTitle = 'sukuwatto: ' + this.feature.user.username + '\'s feature';
      this.shareLink = window.location.origin.replace('android.', 'www.') + this.router.createUrlTree(this.routerLink);
    }
  }

  checkOwner() {
    if (this.feature) {
      this.authenticatedUserIsOwner = this.authService.isCurrentUserLoggedIn(this.feature.user.username);
      this.userIsStaff = this.authService.userIsStaff();
    }
    else {
      this.authenticatedUserIsOwner = false;
      this.userIsStaff = false;
    }
  }

  getTime(date): string {
    return this.timeService.getTimeOrDateIfNotToday(date);
  }

  showDeleteModal() {
    this.deleteModalVisible = true;
  }

  hideDeleteModal() {
    this.deleteModalVisible = false;
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  delete() {
    this.featuresService.deleteFeature(this.feature).subscribe(x => { 
      this.deleteModalVisible = false;

      if (x == null) {
        this.deleted.emit(this.feature);
      }
    });
  }

  toggle() {
    this.toggling = true;
    this.featuresService.toggleFeature(this.feature.id).subscribe(newState => {
      this.toggling = false;

      if (newState != null) {
        this.feature.state = newState;
        this.toggleEditing();
      }
    });
  }

  update() {
    this.triedToSave = true;

    if (this.valid()) {
      this.updating = true;
      this.featuresService.updateFeature(this.feature).subscribe(x => {
      this.updating = false;
        this.feature = x;

        this.toggleEditing();
        this.triedToSave = false;
      });
    }
  }

  valid(): boolean {
    if (!this.featuresService.valid(this.feature)) {
      return false;
    }

    return true;
  }

  getImageUrl(url: string) {
    return environment.mediaUrl + url;
  }

  selectImage(i) {
    this.featureImageIndex = i;
    this.selectCurrentImage();
  }

  previousImage() {
    this.featureImageIndex--;
    if (this.featureImageIndex < 0) {
      this.featureImageIndex = this.feature.feature_images.length - 1;
    }

    this.selectCurrentImage();
  }

  nextImage() {
    this.featureImageIndex++;
    if (this.featureImageIndex > this.feature.feature_images.length - 1) {
      this.featureImageIndex = 0;
    }

    this.selectCurrentImage();
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

  cancel() {
    this.cancelled.emit();
  }

  select() {
    this.selected.emit();
  }
}
