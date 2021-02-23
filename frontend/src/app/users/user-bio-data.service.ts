import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { Observable, Subject } from 'rxjs';
import { Paginated } from './paginated';
import { UserBioData } from './user-bio-data';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserBioDataService {
  private userbiodatasUrl= `${environment.apiUrl}/user-bio-datas/`;
  private userbiodatabydatesUrl= `${environment.apiUrl}/user-bio-datas-by-date/`;
  private userbiodataLast= `${environment.apiUrl}/user-bio-data-last/`;
  private userBodyCompositionLast= `${environment.apiUrl}/user-body-composition-last/`;
  private chartWeightUrl= `${environment.apiUrl}/chart-weight/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  measurementCreated = new Subject<UserBioData>();
  measurementUpdated = new Subject<UserBioData>();
  measurementDeleted = new Subject<UserBioData>();

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  getChartWeight(username: string, date_gte: Date, date_lte: Date): Observable<UserBioData[]> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('user__username', username);
    }

    if (date_lte) {
      params = params.set('date__lte', date_lte.toISOString());
    }

    if (date_gte) {
      params = params.set('date__gte', date_gte.toISOString());
    }

    if (username || date_gte || date_lte) {
      options = {params: params};
    }

    return this.http.get<UserBioData[]>(`${this.chartWeightUrl}`, options)
      .pipe(
        map(response => {
          if (response) {
            response = this.getProperlyTypedUserBioDatas(response);
          }
          return response;
        }),
        catchError(this.errorService.handleError<UserBioData[]>('getChartWeight', (e: any) => 
        { 
          this.alertService.error('Unable to fetch weight chart');
        }, []))
      );
  }


  getUserBioDatasByDate (username: string, date_gte: Date, date_lte: Date): Observable<UserBioData[]> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('user__username', username);
    }

    if (date_lte) {
      params = params.set('date__lte', date_lte.toISOString());
    }

    if (date_gte) {
      params = params.set('date__gte', date_gte.toISOString());
    }

    if (username || date_gte || date_lte) {
      options = {params: params};
    }

    return this.http.get<UserBioData[]>(`${this.userbiodatabydatesUrl}`, options)
      .pipe(
        map(response => {
          if (response) {
            response = this.getProperlyTypedUserBioDatas(response);
          }
          return response;
        }),
        catchError(this.errorService.handleError<UserBioData[]>('getUserBioDatasByDate', (e: any) => 
        { 
          this.alertService.error('Unable to fetch userbiodatas');
        }, []))
      );
  }

  getUserBioDatas (username: string, page: number, page_size: number, ordering: string = null): Observable<Paginated<UserBioData>> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('user__username', username);
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    if (ordering) {
      params = params.set('ordering', ordering.toString());
    }

    if (username || page || page_size || ordering) {
      options = {params: params};
    }

    return this.http.get<Paginated<UserBioData>>(`${this.userbiodatasUrl}`, options)
      .pipe(
        map(response => {
          if (response.results) {
            response.results = this.getProperlyTypedUserBioDatas(response.results);
          }
          return response;
        }),
        catchError(this.errorService.handleError<Paginated<UserBioData>>('getUserBioDatas', (e: any) => 
        { 
          this.alertService.error('Unable to fetch userbiodatas');
        }, new Paginated<UserBioData>()))
      );
  }

  getLastUserBodyComposition(username: string, date_lte: Date = null): Observable<UserBioData> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (date_lte) {
      params = params.set('date_lte', date_lte.toISOString());
    }

    if (username || date_lte) {
      options = {params: params};
    }

    return this.http.get<UserBioData>(`${this.userBodyCompositionLast}`, options)
      .pipe(
        map(response => {
          return this.getProperlyTypedUserBioData(response);
        }),
        catchError(this.errorService.handleError<UserBioData>('getLastUserBodyComposition', (e: any) => 
        { 
          this.alertService.error('Unable to fetch last body composition');
        }, new UserBioData()))
      );
  }

  getLastUserBioData(username: string, date_lte: Date = null): Observable<UserBioData> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
    }

    if (date_lte) {
      params = params.set('date_lte', date_lte.toISOString());
    }

    if (username || date_lte) {
      options = {params: params};
    }

    return this.http.get<UserBioData>(`${this.userbiodataLast}`, options)
      .pipe(
        map(response => {
          return this.getProperlyTypedUserBioData(response);
        }),
        catchError(this.errorService.handleError<UserBioData>('getLastUserBioData', (e: any) => 
        { 
          this.alertService.error('Unable to fetch last userbiodata');
        }, new UserBioData()))
      );
  }
  
  getUserBioData (id: number | string): Observable<UserBioData> {
    return this.http.get<UserBioData>(`${this.userbiodatasUrl}${id}/`)
      .pipe(
        map(response => {
          return this.getProperlyTypedUserBioData(response);
        }),
        catchError(this.errorService.handleError<UserBioData>('getUserBioData', (e: any) => 
        { 
          if (e && e.status && e.status != 404) { 
            this.alertService.error('Unable to fetch userbiodata');
          }
        }, null))
      );
  }

  getProperlyTypedUserBioDatas(userbiodatas: UserBioData[]): UserBioData[] {
    for(let userbiodata of userbiodatas) {
      userbiodata = this.getProperlyTypedUserBioData(userbiodata);
    }

    return userbiodatas;
  }

  getProperlyTypedUserBioData(userbiodata: UserBioData): UserBioData {
    if (userbiodata.date) {
      userbiodata.date = new Date(userbiodata.date);
    }

    if (userbiodata.weight) {
      userbiodata.weight = Number(userbiodata.weight);
    }

    if (userbiodata.height) {
      userbiodata.height = Number(userbiodata.height);
    }

    if (userbiodata.bone_mass_weight) {
      userbiodata.bone_mass_weight = Number(userbiodata.bone_mass_weight);
    }

    if (userbiodata.body_fat_percentage) {
      userbiodata.body_fat_percentage = Number(userbiodata.body_fat_percentage);
    }

    if (userbiodata.water_weight_percentage) {
      userbiodata.water_weight_percentage = Number(userbiodata.water_weight_percentage);
    }

    if (userbiodata.muscle_mass_percentage) {
      userbiodata.muscle_mass_percentage = Number(userbiodata.muscle_mass_percentage);
    }

    if (userbiodata.creation) {
      userbiodata.creation = new Date(userbiodata.creation);
    }

    return userbiodata;
  }

  saveUserBioData(userbiodata: UserBioData): Observable<UserBioData> {
    if (userbiodata.id && userbiodata.id > 0)
      return this.updateUserBioData(userbiodata);

    return this.createUserBioData(userbiodata);
  }

  createUserBioData(userbiodata: UserBioData): Observable<UserBioData> {
    return this.http.post<UserBioData>(this.userbiodatasUrl, userbiodata, this.httpOptions)
    .pipe(
      tap((newUserBioData: UserBioData) => { this.measurementCreated.next(newUserBioData); }),
      catchError(this.errorService.handleError<UserBioData>('createUserBioData', (e: any) => 
      {
        this.alertService.error('Unable to create userbiodata, try again later');
      }, userbiodata))
    );
  }

  updateUserBioData(userbiodata: UserBioData): Observable<UserBioData> {
    return this.http.put<UserBioData>(`${this.userbiodatasUrl}${userbiodata.id}/`, userbiodata, this.httpOptions)
    .pipe(
      tap((updatedUserBioData: UserBioData) => { this.measurementUpdated.next(updatedUserBioData); }),
      catchError(this.errorService.handleError<UserBioData>('updateUserBioData', (e: any) => 
      {
        this.alertService.error('Unable to update userbiodata, try again later');
      }, userbiodata))
    );
  }

  deleteUserBioData(userbiodata: UserBioData): Observable<UserBioData> {
    const id = typeof userbiodata === 'number' ? userbiodata : userbiodata.id;
    const url = `${this.userbiodatasUrl}${id}/`;

    return this.http.delete<UserBioData>(url, this.httpOptions).pipe(
      tap((deletedUserBioData: UserBioData) => { this.measurementDeleted.next(deletedUserBioData); }),
      catchError(this.errorService.handleError<UserBioData>('deleteUserBioData', (e: any) => 
      {
        this.alertService.error('Unable to delete userbiodata, try again later');
      }, new UserBioData()))
    );
  }

  valid(userBioData: UserBioData): boolean {
    if (!userBioData.date) {
      return false;
    }

    if (userBioData.weight && !userBioData.weight_unit) {
      return false;
    }

    if (userBioData.bone_mass_weight && !userBioData.bone_mass_weight_unit) {
      return false;
    }

    if (userBioData.height && !userBioData.height_unit) {
      return false;
    }

    return true;
  }
}
