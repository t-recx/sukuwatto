import { Injectable } from '@angular/core';
import { Workout } from './workout';
import { Observable, forkJoin } from 'rxjs';
import { MetabolicEquivalentTask } from './metabolic-equivalent-task';
import { MetabolicEquivalentService } from './metabolic-equivalent.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CaloriesService {

  constructor(
    private metabolicEquivalentService: MetabolicEquivalentService,
  ) { }

  getCalories(workout: Workout): Observable<number> {
    const warmups = workout.groups.flatMap(w => w.sets.map(s => s)) ?? [];
    const sets = workout.groups.flatMap(w => w.sets.map(s => s)) ?? [];

    const activities = [...warmups, ...sets];

    const exercisesIds = [...new Set(activities.map(a => a.exercise.id))];

    return forkJoin(
      exercisesIds
      .map(exercise => this.metabolicEquivalentService.getMets(exercise))
    ).pipe(
      map (response => new Observable<number>(o => {
        o.next(0);
        o.complete();
      })
    );
  }

  getActivityCalories(mets: MetabolicEquivalentTask[], minutes: number, distance: number, unit: number) {

  }
}
