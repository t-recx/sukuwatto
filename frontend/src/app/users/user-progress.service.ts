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
    return this.workoutsService.getWorkouts(username, 1, 1000).pipe(
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
                        .map(s => new UserProgressDataPoint(s.exercise, s.weight, w.start)))));

          data.dates = [...new Set(values.map(x => x.date))];
          data.series = [...new Set(values.map(x => x.exercise.id))]
            .map(exercise_id => 
                                                   new UserProgressSeries(values.filter(v => v.exercise.id == exercise_id)[0].exercise, values.filter(y => exercise_id == y.exercise.id)));

          obs.next(data);
          obs.complete();
        })
      ));
  }

  getValuesWithMaxWeight(values: UserProgressDataPoint[]) {
    let transformed: UserProgressDataPoint[] = [];

    for (const date of new Set(values.map(v => v.date))) {
      const valuesWithDate = values.filter(v => v.date == date);

      for (const exercise_id of new Set(valuesWithDate.map(v => v.exercise.id))) {
        const valuesWithExerciseId = valuesWithDate.filter(v => v.exercise.id == exercise_id);

        transformed.push(new UserProgressDataPoint(valuesWithExerciseId[0].exercise, Math.max(...valuesWithExerciseId.map(v => v.weight)), date));
      }
    }

    return transformed;
  }
} 
