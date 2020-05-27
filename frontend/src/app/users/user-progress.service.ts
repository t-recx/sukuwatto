import { Injectable } from '@angular/core';
import { UserProgressData, UserProgressDataPoint, UserProgressSeries} from './user-progress-data';
import { WorkoutsService } from './workouts.service';
import { concatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UnitsService } from './units.service';
import { UserBioDataService } from './user-bio-data.service';
import { UserProgressChartData, UserProgressChartDataPoint, UserProgressChartSeries, UserProgressChartType } from './user-progress-chart-data';
import { Workout } from './workout';

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

  getFinishWorkoutProgress(username: string, finishedWorkout: Workout): Observable<UserProgressData> {
    return this.getUserProgress(username, (finishedWorkout.id && finishedWorkout.id > 0) ? []: [finishedWorkout]).pipe(
      concatMap(userProgress => new Observable<UserProgressData>(obs => {
        let data = new UserProgressData();

        let series = userProgress
        .series
        .filter(s => finishedWorkout
          .groups
          .filter(g => g
            .sets
            .filter(gs => gs.done && gs.exercise.id == s.exercise.id).length > 0).length > 0);
            
        let filteredSeries: UserProgressSeries[] = [];
        let filteredDates = [];
        
        series.forEach(s => {
          let dataPoints = s.dataPoints.filter(dp => dp.date.getTime() <= finishedWorkout.end.getTime());

          let lastThreeDates = [...new Set(dataPoints.sort((a,b) => b.date.getTime() - a.date.getTime()).map(x => x.date.getTime()))].slice(0, 3).map(x => new Date(x));

          let filteredDataPoints = dataPoints.filter(dp => lastThreeDates.filter(ldd => ldd.getTime() == new Date(dp.date).getTime()).length > 0);

          filteredSeries.push(new UserProgressSeries(s.exercise, filteredDataPoints));

          filteredDates.push(...lastThreeDates.filter(d => filteredDates.filter(fd => fd == d).length == 0));
        });

        data.series = filteredSeries.sort((x,y) => y.dataPoints.sort((a,b) => b.date.getTime() - a.date.getTime())[0].weight - x.dataPoints.sort((a,b) => b.date.getTime() - a.date.getTime())[0].weight);
        data.dates = filteredDates;

        obs.next(data);
        obs.complete();
      }))
    );
  }

  getUserProgress(username: string, additionalWorkouts: Workout[] = []): Observable<UserProgressData> {
    return this.workoutsService.getWorkouts(username, 1, 1000).pipe(
      concatMap(paginatedWorkouts =>
        new Observable<UserProgressData>(obs => {
          let data = new UserProgressData();

          let values =
            this.getValuesWithMaxWeight(
              paginatedWorkouts
                .results
                .concat(additionalWorkouts ?? [])
                .map(w => this.unitsService.convertWorkout(w))
                .flatMap(w =>
                  w.groups
                    .flatMap(g =>
                      [...new Set(g.sets
                        .filter(s => s.done)
                        .map(s => s.exercise.id))].flatMap(id => 
                          [g.sets
                          .filter(s => s.exercise.id == id)
                          .sort((a,b) => b.weight - a.weight)[0]]
                          .filter(x => x)
                          .map(x => new UserProgressDataPoint(x.exercise, x.weight, w.start))
                          )
                        )));

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
