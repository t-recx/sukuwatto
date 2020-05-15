import { Injectable } from '@angular/core';
import { UserProgressData, UserProgressDataPoint, UserProgressSeries} from './user-progress-data';
import { WorkoutsService } from './workouts.service';
import { concatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UnitsService } from './units.service';

@Injectable({
  providedIn: 'root'
})
export class UserProgressService {

  constructor(
    private workoutsService: WorkoutsService,
    private unitsService: UnitsService,
  ) { }

  getUserProgress(username: string): Observable<UserProgressData> {
    return this.workoutsService.getWorkouts(username).pipe(
      concatMap(paginatedWorkouts =>
        new Observable<UserProgressData>(obs => {
          let data = new UserProgressData();

          let values =
            this.getValuesWithMaxWeight(
              paginatedWorkouts
                .results
                .map(w => this.unitsService.convertWorkout(w))
                .flatMap(w =>
                  w.groups
                    .flatMap(g =>
                      g.sets
                        .filter(s => s.done)
                        .map(s => new UserProgressDataPoint(s.exercise.name, s.weight, w.start)))));

          data.dates = [...new Set(values.map(x => x.date))];
          data.series = [...new Set(values.map(x => x.exercise_name))]
            .map(exercise_name => 
              new UserProgressSeries(exercise_name, values.filter(y => exercise_name == y.exercise_name)));

          obs.next(data);
          obs.complete();
        })
      ));
  }

  getValuesWithMaxWeight(values: UserProgressDataPoint[]) {
    let transformed: UserProgressDataPoint[] = [];

    for (const date of new Set(values.map(v => v.date))) {
      const valuesWithDate = values.filter(v => v.date == date);

      for (const exercise_name of new Set(valuesWithDate.map(v => v.exercise_name))) {
        const valuesWithExerciseName = valuesWithDate.filter(v => v.exercise_name);

        transformed.push(
          new UserProgressDataPoint(exercise_name, Math.max(...valuesWithExerciseName.map(v => v.weight)), date));
      }
    }

    return transformed;
  }
} 
