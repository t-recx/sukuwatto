import { Injectable } from '@angular/core';
import { UserProgressData, UserProgressDataPoint, UserProgressSeries} from './user-progress-data';
import { WorkoutsService } from './workouts.service';
import { concatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UnitsService } from './units.service';
import { UserBioDataService } from './user-bio-data.service';
import { UserProgressChartData, UserProgressChartDataPoint, UserProgressChartSeries, UserProgressChartType } from './user-progress-chart-data';
import { Workout } from './workout';
import { ExerciseType } from './exercise';
import { ChartCategory } from './chart-category';

@Injectable({
  providedIn: 'root'
})
export class UserProgressService {

  constructor(
    private workoutsService: WorkoutsService,
    private userBioDataService: UserBioDataService,
    private unitsService: UnitsService,
  ) { }

  getDistanceMonthComparisonProgress(workouts: Workout[]): Observable<UserProgressChartData> {
    return new Observable<UserProgressChartData>(obs => {

    });
  }

  getDistanceMonthProgress(workouts: Workout[], date: Date): Observable<UserProgressChartData> {
    return new Observable<UserProgressChartData>(obs => {
      const data = new UserProgressChartData();
      data.category = ChartCategory.DistanceMonth;
      data.type = UserProgressChartType.Area;

      data.name = "Distance " + date.toLocaleString('en-GB', { month: 'long' });

      const sets = workouts
      .filter(w => (new Date(w.start)).getMonth() == date.getMonth() && (new Date(w.start)).getFullYear() == date.getFullYear())
      .map(w => this.unitsService.convertWorkout(w))
      .map(w => this.unitsService.convertWorkoutDistanceToBiggerUnits(w))
      .flatMap(w => w
        .groups.flatMap(g => g.
          sets.filter(s => s.distance > 0 && s.distance_unit)
          .flatMap(s => ({set: s, workout: w}))));

      let values = sets.map(x => new UserProgressChartDataPoint(x.set.exercise.name, x.set.distance, x.workout.start));

      if (sets.length > 0 && sets[0].set && sets[0].set.distance_unit) {
        data.unitCode = this.unitsService.getUnitCode(sets[0].set.distance_unit);
      }

      values = [
        ...[...new Set(values.map(x => x.name))]
        .map(name => 
          new UserProgressChartDataPoint(name, 0, new Date(date.getFullYear(), date.getMonth(), 1)))
        , ...values];

      values = values.sort((a, b) => a.date.valueOf() - b.date.valueOf());

      values = this.getAccumulatedValues(values);

      data.dates = [...new Set(values.map(x => x.date))];
      data.series = [...new Set(values.map(x => x.name))]
        .map(name =>
          new UserProgressChartSeries(name,
            values
            .filter(v => v.name == name)));

      obs.next(data);
      obs.complete();
    });
  }

  getAccumulatedValues(values: UserProgressChartDataPoint[]) {
    return values
    .map(o => new UserProgressChartDataPoint(
      o.name,
      o.value + values.filter(oo => oo.name == o.name && oo.date < o.date).reduce((a, b) => a + b.value, 0),
      o.date));
  }

  getUserBioDataProgress(username: string): Observable<UserProgressChartData> {
    return this.userBioDataService.getLastUserBioData(username).pipe(
      concatMap(userBioData =>
        new Observable<UserProgressChartData>(obs => {
          if (userBioData.date) {
            userBioData = this.unitsService.convertUserBioData(userBioData);

            const data = new UserProgressChartData();
            data.category = ChartCategory.BioData;

            data.name = "Body composition";
            data.type = UserProgressChartType.Pie;

            const series = new UserProgressChartSeries(userBioData.date.toLocaleDateString(), []);

            if (userBioData.body_fat_percentage) {
              const bodyFat = new UserProgressChartDataPoint('Fat', userBioData.body_fat_percentage, userBioData.date);
              series.dataPoints.push(bodyFat);
            }

            if (userBioData.muscle_mass_percentage) {
              const muscleMass = new UserProgressChartDataPoint('Muscle', userBioData.muscle_mass_percentage, userBioData.date);
              series.dataPoints.push(muscleMass);
            }

            if (userBioData.water_weight_percentage) {
              const waterWeight = new UserProgressChartDataPoint('Water', userBioData.water_weight_percentage, userBioData.date);
              series.dataPoints.push(waterWeight);
            }

            const rest = new UserProgressChartDataPoint('Other',
              100 - (userBioData.body_fat_percentage ?? 0) -
              (userBioData.muscle_mass_percentage ?? 0) - (userBioData.water_weight_percentage ?? 0), userBioData.date);

            series.dataPoints.push(rest);

            data.series = [series];

            obs.next(data);
          }

          obs.complete();
        })
      ));
  }

  getFinishWorkoutStrengthProgress(username: string, finishedWorkout: Workout): Observable<UserProgressData> {
    let date_gte = new Date(finishedWorkout.start);
    date_gte = new Date(date_gte.valueOf() - this.unitsService.monthInMilliseconds);

    return this.workoutsService.getWorkoutsByDate(username, date_gte, finishedWorkout.start).pipe(
      concatMap(workouts => 
        this.getUserStrengthProgress(workouts, [finishedWorkout]).pipe(
        concatMap(userProgress => new Observable<UserProgressData>(obs => {
          let data = new UserProgressData();

          let series = userProgress
          .series
          .filter(s => finishedWorkout
            .groups
            .filter(g => g
              .sets
              .filter(gs => 
                gs.done && 
                gs.exercise.id == s.exercise.id && 
                gs.exercise.exercise_type == ExerciseType.Strength).length > 0).length > 0);
            
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
      )));
  }

  getUserStrengthProgress(workouts: Workout[], additionalWorkouts: Workout[] = null): Observable<UserProgressData> {
    return new Observable<UserProgressData>(obs => {
      let data = new UserProgressData();

      let values =
        this.getValuesWithMaxWeight(
          workouts
            .filter(r => (additionalWorkouts ?? []).filter(aw => aw.id == r.id).length == 0)
            .concat(additionalWorkouts ?? [])
            .map(w => this.unitsService.convertWorkout(w))
            .flatMap(w =>
              w.groups
                .flatMap(g =>
                  [...new Set(g.sets
                    .filter(s => s.exercise.exercise_type == ExerciseType.Strength)
                    .filter(s => s.done)
                    .filter(s => s.weight && s.weight_unit && s.weight > 0)
                    .map(s => s.exercise.id))].flatMap(id =>
                      [g.sets
                        .filter(s => s.exercise.id == id)
                        .filter(s => s.exercise.exercise_type == ExerciseType.Strength)
                        .sort((a, b) => b.weight - a.weight)[0]]
                        .filter(x => x)
                        .map(x => new UserProgressDataPoint(x.exercise, x.weight, w.start, x.weight_unit))
                    )
                )));

      if (values.filter(v => v.unit).length > 0) {
        data.unitCode = this.unitsService.getUnitCode(values.filter(v => v.unit)[0].unit);
      }

      data.dates = [...new Set(values.map(x => x.date))];
      data.series = [...new Set(values.map(x => x.exercise.id))]
        .map(exercise_id =>
          new UserProgressSeries(values.filter(v => v.exercise.id == exercise_id)[0].exercise, values.filter(y => exercise_id == y.exercise.id)));

      obs.next(data);
      obs.complete();
    });
  }

  getValuesWithMaxWeight(values: UserProgressDataPoint[]) {
    let transformed: UserProgressDataPoint[] = [];

    for (const date of new Set(values.map(v => v.date))) {
      const valuesWithDate = values.filter(v => v.date == date);

      for (const exercise_id of new Set(valuesWithDate.map(v => v.exercise.id))) {
        const valuesWithExerciseId = valuesWithDate.filter(v => v.exercise.id == exercise_id);

        transformed.push(new UserProgressDataPoint(valuesWithExerciseId[0].exercise, Math.max(...valuesWithExerciseId.map(v => v.weight)), date, valuesWithExerciseId[0].unit));
      }
    }

    return transformed;
 }

  getUserWeightData(username: string): Observable<UserProgressChartData> {
    return this.userBioDataService.getUserBioDatas(username, 1, 1000).pipe(
      concatMap(paginatedUserBioDataRecords =>
          new Observable<UserProgressChartData>(obs => {
          let data = new UserProgressChartData();
          data.category = ChartCategory.Weight;
          data.name = "Weight";

          const records =
            paginatedUserBioDataRecords.results
            .filter(w => w.weight_unit)
            .filter(w => w.weight)
            .map(ubd => this.unitsService.convertUserBioData(ubd))
            ;

          const dataPoints = records.map(x => new UserProgressChartDataPoint(data.name, x.weight, x.date));

          if (records.length > 0) {
            data.unitCode = this.unitsService.getUnitCode(records[0].weight_unit);
          }

          data.series = [new UserProgressChartSeries("Weight", dataPoints)];
          data.dates = [...new Set(dataPoints.map(x => x.date))];

          obs.next(data);
          obs.complete();
          })
      ));
  }
} 
