import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FileUploadService } from '../file-upload.service';
import { environment } from 'src/environments/environment';

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

  constructor(
    private uploadService: FileUploadService
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
      this.upload();
    }
  }

  upload() {
    const formData = new FormData();
    const maxCharacters = 80;

    if (this.file.name.length > maxCharacters) {
      var tokens = this.file.name.split('.');
      const newName = tokens[0].slice(0, maxCharacters - 1 - (tokens[1] ? tokens[1].length : 0)) + '.' + (tokens[1] ?? '')
      
      this.file = new File([this.file], newName, {type: this.file.type});
    }

    formData.append('file', this.file);

    this.uploadService.uploadFile(formData).subscribe(
      (response) => {
        if (response && response.file) {
          this.imageURL = `${response.file}`;

          this.uploaded.emit(response.file);
        }
      }
    );
  }
}
