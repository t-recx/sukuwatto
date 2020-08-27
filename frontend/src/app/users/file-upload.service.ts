import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private fileUploadUrl= `${environment.apiUrl}/file-upload/`;

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  uploadFile(file: any): Observable<any> {
    return this.http.post<any>(this.fileUploadUrl, file)
    .pipe(
      catchError(this.errorService.handleError<any>('uploadFile', (e: any) => 
      {
        if (e.status && e.status == 413) {
          this.alertService.error("Unable to upload file, file exceeds maximum size");
          return;
        }
        else if (e.status && e.status == 400) {
          this.alertService.error("Unable to upload file, is it a valid image file?");
          return;
        }

        this.alertService.error('Unable to upload file, try again later');
      }, null))
    );
  }
}
