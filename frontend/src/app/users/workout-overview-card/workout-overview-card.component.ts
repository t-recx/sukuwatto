import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Workout } from '../workout';
import { WorkoutsService } from '../workouts.service';
import { WorkoutOverview } from '../workout-activity-resumed';
import { WorkoutGroup } from '../workout-group';
import { UnitsService } from '../units.service';
import { faCircleNotch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth.service';
import { ExerciseType } from '../exercise';
import { WorkoutSet } from '../workout-set';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { TimeService } from '../time.service';

@Component({
  selector: 'app-workout-overview-card',
  templateUrl: './workout-overview-card.component.html',
  styleUrls: ['./workout-overview-card.component.css']
})
export class WorkoutOverviewCardComponent implements OnInit {
  @Input() workout: Workout;
  @Input() id: number;
  @Input() showSaveDeleteButtons: boolean = false;
  @Input() detailView: boolean = false;
  @Input() commentsSectionOpen: boolean = false;
  @Output() deleted = new EventEmitter();

  loading: boolean = false;
  notFound: boolean = false;

  trackedActivities: WorkoutSet[];
  selectedTrackedActivity: WorkoutSet;
  selectedTrackedActivityIndex: number;

  cardioWorkoutActivities: WorkoutSet[];
  strengthWorkoutActivities: WorkoutOverview[] = [];

  deleteModalVisible: boolean = false;

  deleting: boolean = false;

  faCircleNotch = faCircleNotch;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  routerLink: any;
  shareTitle: string;
  shareLink: string;

  constructor(
    private unitsService: UnitsService,
    private workoutsService: WorkoutsService,
    private authService: AuthService,
    private router: Router,
  ) { }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.deleteModalVisible = false;
    this.deleting = false;

    this.loading = true;
    
    if (!this.workout) {
      this.workoutsService.getWorkout(this.id)
      .subscribe(w =>
        {
          this.workout = w;

          if (this.workout) {
            this.loadWorkoutData(this.workout);
            this.notFound = false;
          }
          else {
            this.notFound = true;
          }
        });
    }
    else {
      this.loadWorkoutData(this.workout);
      this.notFound = false;
    }
  }

  loadWorkoutData(workout: Workout) {
    this.unitsService.convertWorkout(workout);

    this.setTrackedActivities(workout);
    this.setCardioWorkoutActivities(workout);

    this.strengthWorkoutActivities = this.getResumedStrengthActivities(workout);

    this.routerLink = ['/users', workout.user.username, 'workout', workout.id];
    this.shareTitle = 'sukuwatto: ' + workout.user.username + '\'s workout - ' + workout.name;
    this.shareLink = window.location.origin.replace('android.', 'www.') + this.router.createUrlTree(this.routerLink);

    this.loading = false;
  }

  isTracked(s: WorkoutSet): boolean {
    return s.tracking && s.positions && s.positions.length > 0;
  }

  setTrackedActivities(workout: Workout) {
    this.trackedActivities = workout
      .groups
      .flatMap(g => 
        g
        .sets
        .filter(s => s.done && this.isTracked(s)).map(s => s));
    this.selectedTrackedActivity = this.trackedActivities[0];
    this.selectedTrackedActivityIndex = 0;
  }

  showDistanceColumn: boolean = false;
  showTimeColumn: boolean = false;
  showSpeedColumn: boolean = false;
  showVo2MaxColumn: boolean = false;

  setCardioWorkoutActivities(workout: Workout) {
    this.cardioWorkoutActivities = 
      workout
      .groups
      .flatMap(g =>
        g
        .sets
        .filter(s => !this.isTracked(s) && s.done && s.exercise.exercise_type == ExerciseType.Cardio).map(s => s));

    this.setCardioColumnsVisibility(this.cardioWorkoutActivities);
  }

  setCardioColumnsVisibility(activities: WorkoutSet[]) {
    if (activities && activities.length > 0) {
      this.showDistanceColumn = activities.filter(s => s.distance && s.distance > 0).length > 0;
      this.showTimeColumn = activities.filter(s => s.time && s.time > 0).length > 0;
      this.showSpeedColumn = activities.filter(s => s.speed && s.speed > 0).length > 0;
      this.showVo2MaxColumn = activities.filter(s => s.vo2max && s.vo2max > 0 ).length > 0;

      this.showSpeedColumn = this.showSpeedColumn && !(environment.application && this.showTimeColumn && this.showDistanceColumn);
      this.showVo2MaxColumn = this.showVo2MaxColumn &&
        !(environment.application &&
          ((this.showTimeColumn && this.showDistanceColumn) ||
          (this.showTimeColumn && this.showSpeedColumn) ||
          (this.showDistanceColumn && this.showSpeedColumn)));
    }
    else {
      this.showDistanceColumn = false;
      this.showTimeColumn = false;
      this.showSpeedColumn = false;
      this.showVo2MaxColumn = false;
    }
  }

  selectPreviousTrackedActivity() {
    this.selectedTrackedActivityIndex--;

    if (this.selectedTrackedActivityIndex < 0) {
      this.selectedTrackedActivityIndex = this.trackedActivities.length - 1;
    }

    this.selectedTrackedActivity = this.trackedActivities[this.selectedTrackedActivityIndex];
  }

  selectNextTrackedActivity() {
    this.selectedTrackedActivityIndex++;

    if (this.selectedTrackedActivityIndex >= this.trackedActivities.length) {
      this.selectedTrackedActivityIndex = 0;
    }

    this.selectedTrackedActivity = this.trackedActivities[this.selectedTrackedActivityIndex];
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
