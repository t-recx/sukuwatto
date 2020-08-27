import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FileUploadService } from '../file-upload.service';
import { environment } from 'src/environments/environment';
import { AlertService } from 'src/app/alert/alert.service';
import { faFileImport, faCircleNotch, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ImageCroppedEvent, base64ToFile } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements OnInit, OnChanges {
  @Input() title: string;
  @Input() imageURL: string;
  @Output() uploaded = new EventEmitter<string>();

  file: any;
  imageMediaURL: string;

  defaultUploadText: string = "Browse...";
  uploadText: string = this.defaultUploadText;
  uploading: boolean = false;

  faFileImport = faFileImport;
  faCircleNotch = faCircleNotch;

  faCheck = faCheck;
  faTimes = faTimes;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropModal = false;
  loadingCropper = false;

  constructor(
    private uploadService: FileUploadService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.file = null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    let imageURLChanged: boolean = false;

    imageURLChanged = "imageURL" in changes;

    if (imageURLChanged && this.imageURL) {
      this.imageMediaURL = `${environment.mediaUrl}${this.imageURL}`;
    }
  }

  onChange(event) {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];

      this.fileChangeEvent(event);
      this.showCropModal = true;
    }
  }

  upload() {
    const formData = new FormData();

    const maxCharacters = 80;

    let fileName = this.file.name;

    if (fileName.length > maxCharacters) {
      var tokens = fileName.split('.');
      fileName = tokens[0].slice(0, maxCharacters - 1 - (tokens[1] ? tokens[1].length : 0)) + '.' + (tokens[1] ?? '')
    }

    const type = "image/png";

    this.file = new File([base64ToFile(this.croppedImage)], fileName, { type });

    if (this.file.size > environment.maxFileSizeUpload) {
      this.alertService.error(`Unable to upload specified file, size exceeds maximum allowed of ${environment.maxFileSizeUpload / Math.pow(1000, 2)} MBs`)
      return;
    }

    formData.append('file', this.file);

    this.uploading = true;
    this.uploadText = "Uploading...";
    this.uploadService.uploadFile(formData).subscribe(
      (response) => {
        if (response && response.file) {
          this.imageURL = `${response.file}`;

          this.uploaded.emit(response.file);
        }

        this.uploading = false;
        this.uploadText = this.defaultUploadText;
      }
    );
  }

  ok() {
    this.showCropModal = false;
    this.upload();
  }

  cancel() {
    this.showCropModal = false;
  }

  fileChangeEvent(event: any): void {
    this.loadingCropper = true;
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  imageLoaded() {
    // show cropper
  }

  cropperReady() {
    // cropper ready
    this.loadingCropper = false;
  }

  loadImageFailed() {
    // show message
    this.alertService.error('Unable to load image');
    this.loadingCropper = false;
    this.showCropModal = false;
  }

}
