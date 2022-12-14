import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { Observable } from 'rxjs';
import { Exercise, ExerciseType } from './exercise';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Paginated } from './paginated';
import { LanguageService } from '../language.service';

@Injectable({
  providedIn: 'root'
})
export class ExercisesService {
  private exercisesUrl= `${environment.apiUrl}/exercises/`;
  private exerciseInUseApiUrl = `${environment.apiUrl}/exercise-in-use/`;
  private exerciseInUseOnOtherUsersResourcesApiUrl = `${environment.apiUrl}/exercise-in-use-on-other-users-resources/`;
  private topExercisesUrl = `${environment.apiUrl}/top-exercises/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService,
    private languageService: LanguageService,
  ) { }

  getTopExercises(exercise_type: string): Observable<Exercise[]> {
    let options = {};
    let params = new HttpParams();

    if (exercise_type) {
      params = params.set('exercise_type', exercise_type);

      options = {params};
    }

    return this.http.get<Exercise[]>(this.topExercisesUrl, options)
      .pipe(
        map(response => this.getProperlyTypedExercises(response)),
      );
  }

  getExercises (page: number, page_size: number, search_filter: string, ordering: string, exercise_type: string): Observable<Paginated<Exercise>> {
    let options = {};
    let params = new HttpParams();
    const language = this.languageService.getLanguage();

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    if (search_filter) {
      params = params.set('search', search_filter);
    }

    if (ordering) {
      params = params.set('ordering', ordering);
    }

    if (exercise_type) {
      params = params.set('exercise_type', exercise_type);
    }

    if (language) {
      params = params.set('language', language);
    }

    if (page || page_size || search_filter || ordering || exercise_type || language) {
      options = {params: params};
    }

    return this.http.get<Paginated<Exercise>>(this.exercisesUrl, options)
      .pipe(
        map(response => this.getProperlyTypedPaginatedExercises(response)),
      );
  }

  getExercise(id: number | string): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.exercisesUrl}${id}/`)
      .pipe(
        map(response => this.getProperlyTypedExercise(response)),
        catchError(this.errorService.handleError<Exercise>('getExercise', (e: any) => 
        { 
          if (e && e.status && e.status != 404) { 
            this.alertService.error('Unable to fetch exercise');
          }
        }, null))
      );
  }

  getProperlyTypedPaginatedExercises(response: Paginated<Exercise>): Paginated<Exercise> {
    const newResponse = new Paginated<Exercise>(response);

    newResponse.results = this.getProperlyTypedExercises(newResponse.results);

    return newResponse;
  }

  getProperlyTypedExercises(exercises: Exercise[]): Exercise[] {
    if (exercises) {
      for (let exercise of exercises) {
        exercise = this.getProperlyTypedExercise(exercise);
      }
    }

    return exercises;
  }

  getProperlyTypedExercise(exercise: Exercise): Exercise {
    if (exercise) {
      exercise.creation = new Date(exercise.creation);
    }

    return exercise;
  }

  saveExercise(exercise: Exercise): Observable<Exercise> {
    if (exercise.exercise_type == ExerciseType.Cardio) {
      exercise.force = null;
      exercise.mechanics = null;
      exercise.modality = null;
      exercise.section = null;
    }

    if (exercise.id && exercise.id > 0) {
      return this.updateExercise(exercise);
    }

    return this.createExercise(exercise);
  }

  createExercise(exercise: Exercise): Observable<Exercise> {
    return this.http.post<Exercise>(this.exercisesUrl, exercise, this.httpOptions)
    .pipe(
      map(response => this.getProperlyTypedExercise(response)),
      catchError(this.errorService.handleError<Exercise>('createExercise', (e: any) => 
      {
        this.alertService.error('Unable to create exercise, try again later');
      }, null))
    );
  }

  updateExercise(exercise: Exercise): Observable<Exercise> {
    return this.http.put<Exercise>(`${this.exercisesUrl}${exercise.id}/`, exercise, this.httpOptions)
    .pipe(
      map(response => this.getProperlyTypedExercise(response)),
      catchError(this.errorService.handleError<Exercise>('updateExercise', (e: any) => 
      {
        this.alertService.error('Unable to update exercise, try again later');
      }, null))
    );
  }

  deleteExercise(exercise: Exercise|number): Observable<Exercise> {
    const id = typeof exercise === 'number' ? exercise : exercise.id;
    const url = `${this.exercisesUrl}${id}/`;

    return this.http.delete<Exercise>(url, this.httpOptions).pipe(
      catchError(this.errorService.handleError<Exercise>('deleteExercise', (e: any) => 
      {
        this.alertService.error('Unable to delete exercise, try again later');
      }, new Exercise()))
    );
  }

  exerciseInUse(exercise: Exercise): Observable<boolean> {
    let options = {};
    let params = new HttpParams();

    params = params.set('exercise', exercise.id.toString());
    options = {params: params};

    return this.http.get<boolean>(`${this.exerciseInUseApiUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<boolean>('exerciseInUse', (e: any) => 
        { 
          this.alertService.error('Unable to check if exercise in use');
        }, false))
      );
  }

  exerciseInUseOnOtherUsersResources(exercise: Exercise): Observable<boolean> {
    let options = {};
    let params = new HttpParams();

    params = params.set('exercise', exercise.id.toString());
    options = {params: params};

    return this.http.get<boolean>(`${this.exerciseInUseOnOtherUsersResourcesApiUrl}`, options)
      .pipe(
        catchError(this.errorService.handleError<boolean>('exerciseInUseOnOtherUsersResources', (e: any) => 
        { 
          this.alertService.error('Unable to check if exercise in use on other users resources');
        }, false))
      );
  }

  valid(exercise: Exercise): boolean {
    if (!exercise.short_name || exercise.short_name.trim().length == 0) {
      return false;
    }

    if (!exercise.name || exercise.name.trim().length == 0) {
      return false;
    }

    if (!exercise.exercise_type) {
      return false;
    }

    if (exercise.muscles) {
      if (exercise.muscles.filter(m => !m.muscle || !m.muscle.id).length > 0) {
        return false;
      }
      if (exercise.muscles.filter(m => !m.role).length > 0) {
        return false;
      }
    }

    return true;
  }
}
