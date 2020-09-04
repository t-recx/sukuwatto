import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { Post } from '../post';
import { PostsService } from '../posts.service';
import { AuthService } from 'src/app/auth.service';
import { faStickyNote, faCircleNotch, faCheck, faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { TimeService } from '../time.service';
import { environment } from 'src/environments/environment';
import { PostImage } from '../post-image';

@Component({
  selector: 'app-post-detail-card',
  templateUrl: './post-detail-card.component.html',
  styleUrls: ['./post-detail-card.component.css']
})
export class PostDetailCardComponent implements OnInit {
  @Input() id: number;
  @Input() post: Post = null;
  @Input() showHeader: boolean;
  @Input() commentsSectionOpen: boolean = false;
  @Output() deleted = new EventEmitter();

  @ViewChild('previousOverlay') previousOverlay: ElementRef;
  @ViewChild('nextOverlay') nextOverlay: ElementRef;

  faStickyNote = faStickyNote;
  faCircleNotch = faCircleNotch;
  faCheck = faCheck;
  faTimes = faTimes;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  imageUploading = false;

  authenticatedUserIsOwner: boolean = false;

  updating: boolean = false;

  deleteModalVisible: boolean = false;

  editing: boolean = false;

  triedToSave: boolean = false;

  routerLink: any;
  shareTitle: string;
  shareLink: string;

  currentImageUrl = null;
  postImageIndex = 0;
  postImages: string[] = [];

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private router: Router,
    private timeService: TimeService,
    ) { }

  ngOnInit() {
    if (!this.post && this.id) {
      this.postsService.getPost(this.id).subscribe(p => { 
        this.setupPost(p);
      });
    }
    else {
      this.setupPost(this.post);
    }
  }

  private setupPost(p: Post) {
    this.post = p;
    this.postImages = !this.post.post_images ? [] : this.post.post_images.map(u => u.url);
    this.selectCurrentImage();
    this.checkOwner();
    this.routerLink = ['/users', this.post.user.username, 'post', this.post.id];
    this.shareTitle = 'sukuwatto: ' + this.post.user.username + '\'s post';
    this.shareLink = window.location.origin.replace('android.', 'www.') + this.router.createUrlTree(this.routerLink);
  }

  checkOwner() {
    if (this.post) {
      this.authenticatedUserIsOwner = this.authService.isCurrentUserLoggedIn(this.post.user.username);
    }
    else {
      this.authenticatedUserIsOwner = false;
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
    this.postsService.deletePost(this.post).subscribe(x => { 
      this.deleteModalVisible = false;
      this.deleted.emit(this.post);
    });
  }

  update() {
    this.triedToSave = true;

    if (this.valid()) {
      this.updating = true;
      this.postsService.updatePost(this.post).subscribe(x => {
      this.updating = false;
        this.post = x;

        this.toggleEditing();
        this.triedToSave = false;
      });
    }
  }

  valid(): boolean {
    if (this.post.text.trim().length == 0) {
      return false;
    }

    return true;
  }

  getImageUrl(url: string) {
    return environment.mediaUrl + url;
  }

  selectImage(i) {
    this.postImageIndex = i;
    this.selectCurrentImage();
  }

  previousImage() {
    this.postImageIndex--;
    if (this.postImageIndex < 0) {
      this.postImageIndex = this.post.post_images.length - 1;
    }

    this.selectCurrentImage();
  }

  nextImage() {
    this.postImageIndex++;
    if (this.postImageIndex > this.post.post_images.length - 1) {
      this.postImageIndex = 0;
    }

    this.selectCurrentImage();
  }

  selectCurrentImage() {
    if (this.post.post_images && this.post.post_images.length > this.postImageIndex) {
      this.currentImageUrl = this.getImageUrl(this.post.post_images[this.postImageIndex].url);
    }
  }

  addImage(url: string) {
    this.post.post_images.push(new PostImage(url));

    this.postImageIndex = 0;
    this.selectCurrentImage();
  }

  deleteImage(url: string) {
    this.post.post_images = this.post.post_images.filter(p => p.url != url);
    // this.postImages = this.post.post_images.map(p => p.url);

    this.postImageIndex = 0;
    this.selectCurrentImage();
  }

  uploadingInProgress() {
    this.imageUploading = true;
  }

  stoppedUploading() {
    this.imageUploading = false;
  }
}
