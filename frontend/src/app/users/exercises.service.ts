import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { Observable } from 'rxjs';
import { Exercise } from './exercise';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExercisesService {
  private apiUrl = 'http://localhost:8000/api';
  private exercisesUrl= `${this.apiUrl}/exercises/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  getExercises (): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(this.exercisesUrl)
      .pipe(
        catchError(this.errorService.handleError<Exercise[]>('getExercises', (e: any) => 
        { 
          this.alertService.error('Unable to fetch exercises');
        }, []))
      );
  }

  getExercise(id: number | string): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.exercisesUrl}${id}/`)
      .pipe(
        catchError(this.errorService.handleError<Exercise>('getExercise', (e: any) => 
        { 
          this.alertService.error('Unable to fetch exercise');
        }, new Exercise()))
      );
  }

  saveExercise(exercise: Exercise): Observable<Exercise> {
    if (exercise.id && exercise.id > 0)
      return this.updateExercise(exercise);

    return this.createExercise(exercise);
  }

  createExercise(exercise: Exercise): Observable<Exercise> {
    return this.http.post<Exercise>(this.exercisesUrl, exercise, this.httpOptions)
    .pipe(
      catchError(this.errorService.handleError<Exercise>('createExercise', (e: any) => 
      {
        this.alertService.error('Unable to create exercise, try again later');
      }, exercise))
    );
  }

  updateExercise(exercise: Exercise): Observable<Exercise> {
    return this.http.put<Exercise>(`${this.exercisesUrl}${exercise.id}/`, exercise, this.httpOptions)
    .pipe(
      catchError(this.errorService.handleError<Exercise>('updateExercise', (e: any) => 
      {
        this.alertService.error('Unable to update exercise, try again later');
      }, exercise))
    );
  }

  deleteExercise(exercise: Exercise): Observable<Exercise> {
    const id = typeof exercise === 'number' ? exercise : exercise.id;
    const url = `${this.exercisesUrl}${id}/`;

    return this.http.delete<Exercise>(url, this.httpOptions).pipe(
      catchError(this.errorService.handleError<Exercise>('deleteExercise', (e: any) => 
      {
        this.alertService.error('Unable to delete exercise, try again later');
      }, new Exercise()))
    );
  }
}
