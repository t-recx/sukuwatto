import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Post } from '../post';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { environment } from 'src/environments/environment';
import { faImage, faCircleNotch, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-post-images-upload',
  templateUrl: './post-images-upload.component.html',
  styleUrls: ['./post-images-upload.component.css']
})
export class PostImagesUploadComponent implements OnInit {
  @Output() addedImage = new EventEmitter<string>();
  @Output() removedImage = new EventEmitter<string>();
  @Output() uploadingImage = new EventEmitter();
  @Output() stoppedUploadingImage = new EventEmitter();
  @Input() postImages: string[] = [];

  @ViewChild(ImageUploadComponent) imageUploadControl;

  imageUploading: boolean = false;

  faImage = faImage;
  faCircleNotch = faCircleNotch;
  faTrash = faTrash;
  faCheck = faCheck;

  constructor() { }

  ngOnInit(): void {
  }

  setImageUrl(url: string) {
    this.postImages.push(url);

    this.addedImage.emit(url);
  }

  deleteImage(url: string) {
    const i = this.postImages.indexOf(url);

    if (i > -1) {
      this.postImages.splice(i, 1);
    }

    this.removedImage.emit(url);
  }

  getImageUrl(url: string) {
    return environment.mediaUrl + url;
  }

  uploadImage() {
    this.imageUploadControl.selectImage();
  }

  uploadingInProgress() {
    this.imageUploading = true;
    this.uploadingImage.emit();
  }

  stoppedUploading() {
    this.imageUploading = false;
    this.stoppedUploadingImage.emit();
  }

  currentImageModalUrl: string = null;
  imageModalUrl: string = null;
  imageModalVisible = false;

  showImageModal(url: string) {
    this.imageModalVisible = true;
    this.imageModalUrl = url;
    this.currentImageModalUrl = this.getImageUrl(this.imageModalUrl);
  }

  hideImageModal() {
    this.imageModalVisible = false;
  }

  deleteImageModal() {
    this.deleteImage(this.imageModalUrl);
    this.hideImageModal();
  }
}
