import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FileUploadService } from '../file-upload.service';
import { environment } from 'src/environments/environment';
import { AlertService } from 'src/app/alert/alert.service';
import { faFileImport, faCircleNotch, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ImageCroppedEvent, base64ToFile, ImageCropperComponent } from 'ngx-image-cropper';
import { compress, compressAccurately, EImageType } from 'image-conversion';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements OnInit, OnChanges {
  @Input() title: string;
  @Input() imageURL: string;
  @Input() square: boolean;
  @Input() maxSquareSize: number = null;
  @Input() aspectRatio: string = null;
  @Input() maintainAspectRatio: boolean = false;
  @Input() visible: boolean = true;
  @Output() uploaded = new EventEmitter<string>();
  @Output() cancelledCrop = new EventEmitter();
  @Output() uploadingInProgress = new EventEmitter();
  @Output() errorUploading = new EventEmitter();

  @ViewChild(ImageCropperComponent) imageCropper;
  @ViewChild('fileInputControl') fileInput: ElementRef;

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

  croppedImageWidth = 0;
  croppedImageHeight = 0;

  constructor(
    private uploadService: FileUploadService,
    private alertService: AlertService,
    private loadingService: LoadingService,
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

  public selectImage() {
    this.fileInput.nativeElement.click();
  }

  upload() {
    this.uploadingInProgress.emit();
    const formData = new FormData();

    const maxCharacters = 80;

    let fileName = this.file.name;

    if (fileName.length > maxCharacters) {
      var tokens = fileName.split('.');
      fileName = tokens[0].slice(0, maxCharacters - 1 - (tokens[1] ? tokens[1].length : 0)) + '.' + (tokens[1] ?? '')
    }

    const type = "image/png";
    const blob = base64ToFile(this.croppedImage);

    let width = this.croppedImageWidth;
    let height = this.croppedImageHeight;

    if (this.square) {
      if (this.maxSquareSize) {
        width = this.maxSquareSize;
      }

      if (this.croppedImageWidth < width) {
        width = this.croppedImageWidth;
      }

      height = width;
    }

    let maxSize = 700;

    if (width > maxSize) {
      height = (height * maxSize) / width;
      width = maxSize;
    } 

    if (height > maxSize) {
      width = (width * maxSize) / height;
      height = maxSize;
    }

    compress(blob, {
      size: 700,
      quality: 0.8,
      type: EImageType.PNG,
      width,
      height,
    }).then(newBlob => {
      this.file = new File([newBlob], fileName, { type });

      if (this.file.size > environment.maxFileSizeUpload) {
        this.alertService.error(`Unable to upload specified file, size exceeds maximum allowed of ${environment.maxFileSizeUpload / Math.pow(1000, 2)} MBs`)
        this.errorUploading.emit();
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
          else {
            this.errorUploading.emit();
          }

          this.uploading = false;
          this.uploadText = this.defaultUploadText;
        }
      );
    })
  }

  ok() {
    this.loadingCropper = true;
    setTimeout(() => this.imageCropper.crop());
  }

  cancel() {
    this.showCropModal = false;
    this.cancelledCrop.emit();
  }

  fileChangeEvent(event: any): void {
    this.loadingCropper = true;
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageWidth = event.width;
    this.croppedImageHeight = event.height;
    this.croppedImage = event.base64;
    this.loadingCropper = false;
    this.showCropModal = false;
    this.upload();
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
