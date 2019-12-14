import { Component, OnInit } from '@angular/core';
import { WorkoutsService } from '../workouts.service';
import { Workout } from '../workout';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Exercise } from '../exercise';
import { Unit, MeasurementType } from '../unit';
import { ExercisesService } from '../exercises.service';
import { UnitsService } from '../units.service';
import { WorkoutGroup } from '../workout-group';
import { RepetitionType } from '../plan-session-group-activity';
import { WorkoutActivityResumed } from '../workout-activity-resumed';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.component.html',
  styleUrls: ['./workouts.component.css']
})
export class WorkoutsComponent implements OnInit {
  workouts: Workout[];
  exercises: Exercise[];
  units: Unit[];

  repetitionType = RepetitionType;

  constructor(
    private workoutsService: WorkoutsService,
    private authService: AuthService,
    public route: ActivatedRoute, 
    private exercisesService: ExercisesService,
    private unitsService: UnitsService,
  ) { }

  ngOnInit() {
    this.loadExercises();
    this.loadUnits();
    this.getWorkouts();
  }

  getWorkouts(): void {
    let username= this.route.snapshot.paramMap.get('username');

    if (!username || username.length == 0) {
      username = this.authService.getUsername();
    }

    if (username) {
      this.workoutsService.getWorkouts(username)
        .subscribe(workouts => this.workouts = workouts);
    }
  }

  deleteWorkout(workout): void {
    this.workoutsService.deleteWorkout(workout).subscribe(_ => this.getWorkouts());
  }

  getProductiveGroups(groups: WorkoutGroup[]): WorkoutGroup[] {
    let productiveGroups: WorkoutGroup[] = [];

    productiveGroups = groups.filter(g => g.sets.filter(s => s.done).length > 0);

    return productiveGroups;
  }

  getResumedActivities(group: WorkoutGroup): WorkoutActivityResumed[] {
    let activities: WorkoutActivityResumed[] = [];
    let doneSets = group.sets.filter(s => s.done);

    for (let exercise of new Set(doneSets.map(s => s.exercise))) {
      let setsWithExercise = doneSets.filter(s => s.exercise == exercise);
      for (let weight of new Set(setsWithExercise.map(s => s.weight))) {
        let setsWithWeight = setsWithExercise.filter(s => s.weight == weight);
        for (let numberReps of new Set(setsWithWeight.map(s => s.number_of_repetitions))) {
          let setsWithNumberReps = setsWithWeight.filter(s => s.number_of_repetitions == numberReps);
          for (let unit of new Set(setsWithNumberReps.map(s => s.unit))) {
            let setsWithUnit = setsWithNumberReps.filter(s => s.unit == unit);
            let activity = new WorkoutActivityResumed();

            activity.exercise = exercise;
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

  loadExercises() {
    this.exercisesService.getExercises().subscribe(exercises => this.exercises = exercises);
  }

  loadUnits() {
    this.unitsService.getUnits().subscribe(units => {
      this.units = units.filter(u => u.measurement_type == MeasurementType.Weight);
    });
  }
}
