import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { Observable } from 'rxjs';
import { Paginated } from './paginated';
import { catchError, tap, map } from 'rxjs/operators';
import { Release, ReleaseState  } from './release';
import { FeaturesService } from './features.service';

@Injectable({
  providedIn: 'root'
})
export class ReleasesService {
  private releasesUrl= `${environment.apiUrl}/releases/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService,
    private featuresService: FeaturesService,
  ) { }

  getReleases (page: number, page_size: number, state: ReleaseState = null): Observable<Paginated<Release>> {
    let options = {};
    let params = new HttpParams();

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    if (state) {
      params = params.set('state', state.toString());
    }

    if (page || page_size || state) {
      options = {params: params};
    }

    return this.http.get<Paginated<Release>>(`${this.releasesUrl}`, options)
      .pipe(
        map(response => {
          if (response.results) {
            response.results = this.getProperlyTypedReleases(response.results);
          }
          return response;
        })
      );
  }

  getRelease (id: number | string): Observable<Release> {
    return this.http.get<Release>(`${this.releasesUrl}${id}/`)
      .pipe(
        map(response => {
          return this.getProperlyTypedRelease(response);
        }),
        catchError(this.errorService.handleError<Release>('getRelease', (e: any) => 
        { 
          if (e && e.status && e.status != 404) { 
            this.alertService.error('Unable to fetch release');
          }
        }, null))
      );
  }

  getProperlyTypedReleases(releases: Release[]): Release[] {
    for(let release of releases) {
      release = this.getProperlyTypedRelease(release);
    }

    return releases;
  }

  getProperlyTypedRelease(release: Release): Release {
    release.date = new Date(release.date);

    if (release.deploy_date) {
        release.deploy_date = new Date(release.deploy_date);
    }

    if (release.features) {
      release.features.forEach(f => this.featuresService.getProperlyTypedFeature(f));
    }

    return release;
  }

  saveRelease(release: Release): Observable<Release> {
    if (release.id && release.id > 0) {
      return this.updateRelease(release);
    }

    return this.createRelease(release);
  }

  createRelease(release: Release): Observable<Release> {
    return this.http.post<Release>(this.releasesUrl, release, this.httpOptions)
    .pipe(
      tap((newRelease: Release) => { }),
      catchError(this.errorService.handleError<Release>('createRelease', (e: any) => 
      {
        this.alertService.error('Unable to create release, try again later');
      }, release))
    );
  }

  updateRelease(release: Release): Observable<Release> {
    return this.http.put<Release>(`${this.releasesUrl}${release.id}/`, release, this.httpOptions)
    .pipe(
      tap((newRelease: Release) => { }),
      catchError(this.errorService.handleError<Release>('updateRelease', (e: any) => 
      {
        this.alertService.error('Unable to update release, try again later');
      }, this.getProperlyTypedRelease(release)))
    );
  }

  deleteRelease(release: Release): Observable<Release> {
    const id = typeof release === 'number' ? release : release.id;
    const url = `${this.releasesUrl}${id}/`;

    return this.http.delete<Release>(url, this.httpOptions).pipe(
      catchError(this.errorService.handleError<Release>('deleteRelease', (e: any) => 
      {
        this.alertService.error('Unable to delete release, try again later');
      }, new Release()))
    );
  }

  valid(release: Release): boolean {
    if (!release.version || release.version.trim().length == 0) {
      return false;
    }

    if (!release.description || release.description.trim().length == 0) {
      return false;
    }

    if (!release.state) {
      return false;
    }

    if (release.state == ReleaseState.Done &&
      !release.deploy_date) {
      return false;
    }

    return true;
  }
}
