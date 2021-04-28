import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { Observable } from 'rxjs';
import { Paginated } from './paginated';
import { catchError, tap, map } from 'rxjs/operators';
import { Feature, FeatureState } from './feature';

@Injectable({
  providedIn: 'root'
})
export class FeaturesService {
  private featuresUrl= `${environment.apiUrl}/features/`;
  private toggleFeatureUrl = `${environment.apiUrl}/toggle-feature/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  getFeatures (page: number, page_size: number, search_filter: string, state: FeatureState): Observable<Paginated<Feature>> {
    let options = {};
    let params = new HttpParams();

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    if (search_filter) {
      params = params.set('search', search_filter.toString());
    }

    if (state) {
      params = params.set('state', state.toString());
    }

    if (page || page_size || search_filter || state) {
      options = {params: params};
    }

    return this.http.get<Paginated<Feature>>(`${this.featuresUrl}`, options)
      .pipe(
        map(response => {
          if (response.results) {
            response.results = this.getProperlyTypedFeatures(response.results);
          }
          return response;
        })
      );
  }

  getFeature (id: number | string): Observable<Feature> {
    return this.http.get<Feature>(`${this.featuresUrl}${id}/`)
      .pipe(
        map(response => {
          return this.getProperlyTypedFeature(response);
        }),
        catchError(this.errorService.handleError<Feature>('getFeature', (e: any) => 
        { 
          if (e && e.status && e.status != 404) { 
            this.alertService.error('Unable to fetch feature');
          }
        }, null))
      );
  }

  getProperlyTypedFeatures(features: Feature[]): Feature[] {
    for(let feature of features) {
      feature = this.getProperlyTypedFeature(feature);
    }

    return features;
  }

  getProperlyTypedFeature(feature: Feature): Feature {
    feature.date = new Date(feature.date);
    if (feature.edited_date) {
        feature.edited_date = new Date(feature.edited_date);
    }

    return feature;
  }

  saveFeature(feature: Feature): Observable<Feature> {
    if (feature.id && feature.id > 0) {
      return this.updateFeature(feature);
    }

    return this.createFeature(feature);
  }

  toggleFeature(id: number): Observable<FeatureState> {
    return this.http.post<any>(this.toggleFeatureUrl, { id }, this.httpOptions)
    .pipe(
      catchError(this.errorService.handleError<FeatureState>('toggleFeature', (e: any) => 
      {
        this.alertService.error('Unable to toggle feature, try again later');
      }, null))
    );
  }

  createFeature(feature: Feature): Observable<Feature> {
    return this.http.post<Feature>(this.featuresUrl, feature, this.httpOptions)
    .pipe(
      tap((newFeature: Feature) => { }),
      catchError(this.errorService.handleError<Feature>('createFeature', (e: any) => 
      {
        this.alertService.error('Unable to create feature, try again later');
      }, feature))
    );
  }

  updateFeature(feature: Feature): Observable<Feature> {
    return this.http.put<Feature>(`${this.featuresUrl}${feature.id}/`, feature, this.httpOptions)
    .pipe(
      tap((newFeature: Feature) => { }),
      catchError(this.errorService.handleError<Feature>('updateFeature', (e: any) => 
      {
        if (e && e.status && e.status == 403) {
          if (feature.release != null) {
            this.alertService.error('Unable to update feature: it\'s already associated with a release');
          }
          else {
            this.alertService.error('You don\'t have permission to update this feature');
          }
        }
        else {
          this.alertService.error('Unable to update feature, try again later');
        }
      }, this.getProperlyTypedFeature(feature)))
    );
  }

  deleteFeature(feature: Feature|number): Observable<Feature> {
    const id = typeof feature === 'number' ? feature : feature.id;
    const url = `${this.featuresUrl}${id}/`;

    return this.http.delete<Feature>(url, this.httpOptions).pipe(
      catchError(this.errorService.handleError<Feature>('deleteFeature', (e: any) => 
      {
        if (e && e.status && e.status == 403) {
          if (!(typeof feature === 'number') && feature.release != null) {
            this.alertService.error('Unable to delete feature: it\'s already associated with a release');
          }
          else {
            this.alertService.error('You don\'t have permission to delete this feature');
          }
        }
        else {
          this.alertService.error('Unable to delete feature, try again later');
        }
      }, new Feature()))
    );
  }

  valid(feature: Feature): boolean {
    if (!feature.title || feature.title.trim().length == 0) {
      return false;
    }

    if (!feature.text || feature.text.trim().length == 0) {
      return false;
    }

    return true;
  }
}
