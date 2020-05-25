import { Injectable } from '@angular/core';
import { UserProgressData, UserProgressDataPoint, UserProgressSeries} from './user-progress-data';
import { WorkoutsService } from './workouts.service';
import { concatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UnitsService } from './units.service';
import { UserBioDataService } from './user-bio-data.service';
import { UserProgressChartData, UserProgressChartDataPoint, UserProgressChartSeries, UserProgressChartType } from './user-progress-chart-data';

@Injectable({
  providedIn: 'root'
})
export class UserProgressService {

  constructor(
    private workoutsService: WorkoutsService,
    private userBioDataService: UserBioDataService,
    private unitsService: UnitsService,
  ) { }

  getUserBioDataProgress(username: string): Observable<UserProgressChartData> {
    return this.userBioDataService.getLastUserBioData(username, new Date()).pipe(
      concatMap(userBioData =>
        new Observable<UserProgressChartData>(obs => {
          let data = new UserProgressChartData();

          data.name = "Body composition";
          data.type = UserProgressChartType.Pie;


          let series = new UserProgressChartSeries(userBioData.date.toLocaleDateString(), []);

          if (userBioData.body_fat_percentage) {
            let bodyFat = new UserProgressChartDataPoint('Fat', userBioData.body_fat_percentage, userBioData.date);
            series.dataPoints.push(bodyFat);
          }

          if (userBioData.muscle_mass_percentage) {
            let muscleMass = new UserProgressChartDataPoint('Muscle', userBioData.muscle_mass_percentage, userBioData.date);
            series.dataPoints.push(muscleMass);
          }

          if (userBioData.water_weight_percentage) {
            let waterWeight = new UserProgressChartDataPoint('Water', userBioData.water_weight_percentage, userBioData.date);
            series.dataPoints.push(waterWeight);
          }

          let rest = new UserProgressChartDataPoint('Other', 100 - userBioData.body_fat_percentage ?? 0 - userBioData.muscle_mass_percentage ?? 0 - userBioData.water_weight_percentage ?? 0, userBioData.date);

          series.dataPoints.push(rest);

          data.series = [series];

          obs.next(data);
          obs.complete();
        })
      ));
  }

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

  getUserWeightData(username: string): Observable<UserProgressChartData> {
    return this.userBioDataService.getUserBioDatas(username, 1, 1000).pipe(
      concatMap(paginatedUserBioDataRecords =>
          new Observable<UserProgressChartData>(obs => {
          let data = new UserProgressChartData();
          data.name = "Weight";

          let dataPoints = 
            paginatedUserBioDataRecords.results
            .filter(w => w.weight)
            .map(x => new UserProgressChartDataPoint(data.name, x.weight, x.date));

          data.series = [new UserProgressChartSeries("Weight", dataPoints)];
          data.dates = [...new Set(dataPoints.map(x => x.date))];

          obs.next(data);
          obs.complete();
          })
      ));
  }
} 
