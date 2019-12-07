import { Component, OnInit } from '@angular/core';
import { Workout } from '../workout';
import { Plan } from '../plan';
import { WorkoutsService } from '../workouts.service';
import { PlansService } from '../plans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanSession } from '../plan-session';
import { ExercisesService } from '../exercises.service';
import { Exercise } from '../exercise';
import { WorkoutGroup } from '../workout-group';
import { Unit, MeasurementType } from '../unit';
import { UnitsService } from '../units.service';
import { AuthService } from 'src/app/auth.service';
import { WorkoutGeneratorService } from '../workout-generator.service';
import { WorkoutSet } from '../workout-set';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-workout-detail',
  templateUrl: './workout-detail.component.html',
  styleUrls: ['./workout-detail.component.css']
})
export class WorkoutDetailComponent implements OnInit {
  workout: Workout;
  adoptedPlans: Plan[];
  planSessions: PlanSession[];
  exercises: Exercise[];
  units: Unit[];
  triedToSave: boolean;
  workingWeightsVisible: boolean = false;

  activityStatusChangedSubject: Subject<void> = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private service: WorkoutsService,
    private plansService: PlansService,
    private exercisesService: ExercisesService,
    private unitsService: UnitsService,
    private router: Router,
    private authService: AuthService,
    private workoutGeneratorService: WorkoutGeneratorService,
  ) { }

  ngOnInit() {
    this.triedToSave = false;
    this.loadAdoptedPlans();
    this.loadExercises();
    this.loadUnits();
    this.loadOrInitializeWorkout();
  }

  loadOrInitializeWorkout() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.getWorkout(id).subscribe(workout => {
        this.workout = workout;
      });
    }
    else {
      this.workout = new Workout();
      this.workout.start = new Date();

      this.setNextActivityInProgress();

      this.service.getLastWorkout(this.authService.getUsername(), null, new Date()).subscribe(w =>
        {
          if (w.working_weights) {
            this.workout.working_weights = w.working_weights;
          }
        });
        console.log(this.workout);
    }
  }

  loadExercises() {
    this.exercisesService.getExercises().subscribe(exercises => this.exercises = exercises);
  }

  loadUnits() {
    this.unitsService.getUnits().subscribe(units => {
      this.units = units.filter(u => u.measurement_type == MeasurementType.Weight);
    });
  }

  loadAdoptedPlans() {
    let username = this.route.snapshot.paramMap.get('username');

    this.plansService.getAdoptedPlans(username).subscribe(plans => 
      {
        this.adoptedPlans = plans;
        if (plans && plans.length == 1) {
          this.workout.plan = plans[0].id;
          this.planChanged();
        }
      });
  }

  planChanged() {
    if (this.workout.plan) {
      this.planSessions = this.adoptedPlans
        .filter(plan => plan.id == this.workout.plan)
        .map(plan => plan.sessions)[0];

      // todo: autoselect plansession based on previous user plan session
    }
  }

  activityStatusChanged(): void {
    this.resetInProgressForAllActivities();
    this.setNextActivityInProgress();
    this.activityStatusChangedSubject.next();
  }

  resetInProgressForAllActivities(): void {
    let activities: WorkoutSet[] = [];

    for (let group of this.workout.groups) {
      activities.push(...group.warmups);
      activities.push(...group.sets);
    }

    for (let activity of activities) {
      activity.in_progress = false;
    }
  }

  setNextActivityInProgress(): void {
    let activities: WorkoutSet[] = [];

    for (let group of this.workout.groups) {
      activities.push(...group.warmups);
      activities.push(...group.sets);
    }

    if (activities.length == 0) {
      return;
    }

    if (activities.filter(a => a.in_progress).length > 0) {
      return;
    }

    let activitiesWithEndSet = activities.filter(a => a.end);

    if (activitiesWithEndSet.length == 0) {
      this.setActivityInProgress(activities[0]);

      return;
    }

    let lastCompletedActivity = 
      activitiesWithEndSet
      .filter(a => a.done)
      .sort((a,b) => (new Date(b.end)).getTime() - (new Date(a.end)).getTime())[0];

    console.log(lastCompletedActivity);

    let setNext = false;
    for (let activity of activities) {
      if (!activity.done && setNext) {
        this.setActivityInProgress(activity);
        break;
      }

      if (activity == lastCompletedActivity) {
        setNext= true;
      }
    }
  }

  setActivityInProgress(activity: WorkoutSet) {
    activity.in_progress = true;
    activity.start = new Date();
  }

  showWorkingWeights() {
    this.workingWeightsVisible = true;    
  }

  sessionChanged() {
    let plan = this.adoptedPlans.filter(x => x.id == this.workout.plan)[0];
    let planSession = this.planSessions.filter(x => x.id == this.workout.plan_session)[0];

    if (plan && planSession && (this.workout.id == null || this.workout.id <= 0)) {
      this.workoutGeneratorService.generate(this.exercises, this.workout.working_weights, plan, planSession)
      .subscribe(newWorkout => { 
        this.workout = newWorkout; 
        this.setNextActivityInProgress();
        console.log(this.workout); 
      });
    }
  }

  newGroup() {
    let newGroup = new WorkoutGroup();

    if (this.workout.plan_session && this.workout.groups.length > 0) {
      newGroup.name = "Additional exercises";
    }
    else {
      newGroup.name = "New group";
    }

    this.workout.groups.push(newGroup);
  }

  save() {
    this.triedToSave = true;

    if (!this.valid(this.workout)) {
      return;
    }

    this.service.saveWorkout(this.workout).subscribe(workout => {
      this.triedToSave = false;

      if (!this.workout.id || this.workout.id <= 0) {
        this.router.navigate(['../workouts'], {
          relativeTo: this.route,
        });
      }
      else {
        this.router.navigate(['../../workouts'], {
          relativeTo: this.route,
        });
      }
    });
  }

  onWorkingWeightsClosed() {
    this.workingWeightsVisible = false;
    this.workoutGeneratorService.updateWeights(this.workout, this.workout.working_weights);
  }

  valid(workout: Workout): boolean {
    // todo
    return true;
  }
}
