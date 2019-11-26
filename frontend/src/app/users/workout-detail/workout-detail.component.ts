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
import { Unit } from '../unit';
import { UnitsService } from '../units.service';
import { WorkingWeightsService } from '../working-weights.service';
import { AuthService } from 'src/app/auth.service';

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

  constructor(
    private route: ActivatedRoute,
    private service: WorkoutsService,
    private plansService: PlansService,
    private exercisesService: ExercisesService,
    private unitsService: UnitsService,
    private router: Router,
    private workingWeightsService: WorkingWeightsService,
    private authService: AuthService,
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
      this.workingWeightsService.getWorkingWeights(this.authService.getUsername(), new Date())
        .subscribe(workingWeights => this.workout.working_weights = workingWeights);
    }
  }

  loadExercises() {
    this.exercisesService.getExercises().subscribe(exercises => this.exercises = exercises);
  }

  loadUnits() {
    this.unitsService.getUnits().subscribe(units => this.units = units);
  }

  loadAdoptedPlans() {
    let username = this.route.snapshot.paramMap.get('username');

    this.plansService.getAdoptedPlans(username).subscribe(plans => this.adoptedPlans = plans);
  }

  planChanged() {
    this.planSessions = this.adoptedPlans
      .filter(plan => plan.id == this.workout.plan)
      .map(plan => plan.sessions)[0];
  }

  showWorkingWeights() {
    this.workingWeightsVisible = true;    
  }

  sessionChanged() {
    // todo: fill workout if empty
  }

  newGroup() {
    let newGroup = new WorkoutGroup();
    newGroup.name = "New group";

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

  valid(workout: Workout): boolean {
    // todo
    return true;
  }
}
