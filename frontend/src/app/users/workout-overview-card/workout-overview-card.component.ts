import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Workout } from '../workout';
import { WorkoutsService } from '../workouts.service';
import { WorkoutOverview } from '../workout-activity-resumed';
import { WorkoutGroup } from '../workout-group';

@Component({
  selector: 'app-workout-overview-card',
  templateUrl: './workout-overview-card.component.html',
  styleUrls: ['./workout-overview-card.component.css']
})
export class WorkoutOverviewCardComponent implements OnInit {
  @Input() workout: Workout;
  @Input() id: number;
  @Input() showSaveDeleteButtons: boolean = false;
  @Output() deleted = new EventEmitter();

  constructor(
    private workoutsService: WorkoutsService,
  ) { }

  ngOnInit() {
    if (!this.workout) {
      this.workoutsService.getWorkout(this.id).subscribe(w =>
        {
          this.workout = w;
        });
    }
  }

  getProductiveGroups(groups: WorkoutGroup[]): WorkoutGroup[] {
    let productiveGroups: WorkoutGroup[] = [];

    productiveGroups = groups.filter(g => g.sets.filter(s => s.done).length > 0);

    return productiveGroups;
  }

  getResumedActivities(workout: Workout): WorkoutOverview[] {
    let activities: WorkoutOverview[] = [];
    let groups = this.getProductiveGroups(workout.groups);

    for (let group of groups) {
      activities.push(...this.getResumedActivitiesGroup(group));
    }

    return activities;
  }

  getResumedActivitiesGroup(group: WorkoutGroup): WorkoutOverview[] {
    let activities: WorkoutOverview[] = [];
    let doneSets = group.sets.filter(s => s.done);

    for (let exercise_id of new Set(doneSets.map(s => s.exercise.id))) {
      let exercise = doneSets.filter(s => s.exercise.id == exercise_id)[0].exercise;
      let setsWithExercise = doneSets.filter(s => s.exercise.id == exercise_id);
      for (let weight of new Set(setsWithExercise.map(s => s.weight))) {
        let setsWithWeight = setsWithExercise.filter(s => s.weight == weight);
        for (let numberReps of new Set(setsWithWeight.map(s => s.number_of_repetitions))) {
          let setsWithNumberReps = setsWithWeight.filter(s => s.number_of_repetitions == numberReps);
          for (let unit of new Set(setsWithNumberReps.map(s => s.unit))) {
            let setsWithUnit = setsWithNumberReps.filter(s => s.unit == unit);
            let activity = new WorkoutOverview();

            activity.exercise = {...exercise};
            activity.weight = weight;
            activity.number_of_repetitions = numberReps;
            activity.unit = unit;
            activity.number_of_sets = setsWithUnit.length;

            activities.push(activity);
          }
        }
      }
    }

    return activities;
  }

  deleteWorkout(): void {
    this.deleted.emit(this.workout);
  }
}