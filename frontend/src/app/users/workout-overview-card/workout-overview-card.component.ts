import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Workout } from '../workout';
import { WorkoutsService } from '../workouts.service';
import { WorkoutOverview } from '../workout-activity-resumed';
import { WorkoutGroup } from '../workout-group';
import { UnitsService } from '../units.service';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth.service';
import { ExerciseType } from '../exercise';

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

  workoutActivities: WorkoutOverview[] = [];

  deleteModalVisible: boolean = false;
  dateString: string;

  deleting: boolean = false;

  faCircleNotch = faCircleNotch;

  constructor(
    private unitsService: UnitsService,
    private workoutsService: WorkoutsService,
    private authService: AuthService,
  ) { }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.deleteModalVisible = false;
    this.deleting = false;
    this.dateString = null;

    if (!this.workout) {
      this.workoutsService.getWorkout(this.id).subscribe(w =>
        {
          this.workout = w;
          this.workoutActivities = this.getResumedStrengthActivities(w);
          if (this.workout.start) {
            this.dateString = (new Date(this.workout.start)).toLocaleDateString();
          }
        });
    }
    else {
      this.workoutActivities = this.getResumedStrengthActivities(this.workout);

      if (this.workout.start) {
        this.dateString = (new Date(this.workout.start)).toLocaleDateString();
      }
    }
  }

  getProductiveStrengthGroups(groups: WorkoutGroup[]): WorkoutGroup[] {
    let productiveGroups: WorkoutGroup[] = [];

    productiveGroups = groups.filter(g => g.sets.filter(s => s.done && s.exercise.exercise_type == ExerciseType.Strength).length > 0);

    return productiveGroups;
  }

  getResumedStrengthActivities(workout: Workout): WorkoutOverview[] {
    let activities: WorkoutOverview[] = [];
    let groups = this.getProductiveStrengthGroups(workout.groups);

    for (let group of groups) {
      activities.push(...this.getResumedStrengthActivitiesGroup(group));
    }

    return activities;
  }

  getResumedStrengthActivitiesGroup(group: WorkoutGroup): WorkoutOverview[] {
    let activities: WorkoutOverview[] = [];
    let doneSets = group.sets.filter(s => s.done && s.exercise.exercise_type == ExerciseType.Strength);

    for (let exercise_id of new Set(doneSets.map(s => s.exercise.id))) {
      let exercise = doneSets.filter(s => s.exercise.id == exercise_id)[0].exercise;
      let setsWithExercise = doneSets.filter(s => s.exercise.id == exercise_id);
      for (let weight of new Set(setsWithExercise.map(s => s.weight))) {
        let setsWithWeight = setsWithExercise.filter(s => s.weight == weight);
        for (let numberReps of new Set(setsWithWeight.map(s => s.number_of_repetitions))) {
          let setsWithNumberReps = setsWithWeight.filter(s => s.number_of_repetitions == numberReps);
          for (let unit of new Set(setsWithNumberReps.map(s => s.weight_unit))) {
            let setsWithUnit = setsWithNumberReps.filter(s => s.weight_unit == unit);
            let activity = new WorkoutOverview();

            activity.exercise = {...exercise};
            activity.weight = weight;
            activity.number_of_repetitions = numberReps;
            activity.weight_unit = unit;
            activity.number_of_sets = setsWithUnit.length;
            this.unitsService.convertWorkoutOverview(activity);

            activities.push(activity);
          }
        }
      }
    }

    return activities;
  }

  delete(): void {
    this.deleting = true;
    this.deleteModalVisible = false;
    this.deleted.emit(this.workout);
  }

  toggleDeleteModal(): void {
    this.deleteModalVisible = !this.deleteModalVisible;
  }

  getUnitCode(unit: number): string {
    return this.unitsService.getUnitCode(unit);
  }
}
