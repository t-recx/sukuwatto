import { Component, OnInit } from '@angular/core';
import { Workout, WorkoutStatus } from '../workout';
import { Plan } from '../plan';
import { WorkoutsService } from '../workouts.service';
import { PlansService } from '../plans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanSession } from '../plan-session';
import { WorkoutGroup } from '../workout-group';
import { WorkoutGeneratorService } from '../workout-generator.service';
import { WorkoutSet } from '../workout-set';
import { Subject, Observable } from 'rxjs';
import { WorkingWeight } from '../working-weight';
import { UserBioData } from '../user-bio-data';
import { UserBioDataService } from '../user-bio-data.service';
import { concatMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-workout-detail',
  templateUrl: './workout-detail.component.html',
  styleUrls: ['./workout-detail.component.css']
})
export class WorkoutDetailComponent implements OnInit {
  workout: Workout;
  previousWorkout: Workout;

  adoptedPlans: Plan[];
  planSessions: PlanSession[];
  triedToSave: boolean;
  workingWeightsVisible: boolean = false;
  userBioDataVisible: boolean = false;
  userBioData: UserBioData = null;
  finishWorkoutVisible: boolean = false;
  username: string;

  activityStatusChangedSubject: Subject<void> = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private service: WorkoutsService,
    private userBioDataService: UserBioDataService,
    private plansService: PlansService,
    private router: Router,
    private workoutGeneratorService: WorkoutGeneratorService,
    private authService: AuthService,
  ) { }

  setWorkoutStartDate(event: any) {
    if (event && this.workout) {
      if (this.workout.start) {
        this.workout.start = new Date(event + " " + new Date(this.workout.start).toTimeString().substring(0, 5));
      }
      else {
        this.workout.start = new Date(event);
      }

      let planSession: PlanSession = null;

      if (this.workout.plan_session && this.planSessions) {
        planSession = this.planSessions.filter(s => s.id == this.workout.plan_session)[0];
      }

      this.workout.name = this.workoutGeneratorService.getWorkoutName(this.workout.start, planSession);
    }
  }

  setWorkoutStartTime(event: any) {
    if (event && this.workout) {
      if (this.workout.start) {
        this.workout.start = new Date(
          new Date(this.workout.start).toISOString().substring(0, 10) + " " + event); 
      }
      else {
        this.workout.start = new Date(
          (new Date()).toISOString().substring(0, 10) + " " + event); 
      }
    }
  }

  setWorkoutEndDate(event: any) {
    if (event && this.workout) {
      if (this.workout.end) {
        this.workout.end = new Date(event + " " + new Date(this.workout.end).toTimeString().substring(0, 5));
      }
      else {
        this.workout.end = new Date(event);
      }
    }
  }

  setWorkoutEndTime(event: any) {
    if (event && this.workout) {
      if (this.workout.end) {
        this.workout.end = new Date(
          new Date(this.workout.end).toISOString().substring(0, 10) + " " + event); 
      }
      else {
        this.workout.end = new Date(
          (new Date()).toISOString().substring(0, 10) + " " + event); 
      }
    }
  }

  ngOnInit() {
    this.triedToSave = false;
    this.userBioData = null;

    this.route.paramMap.subscribe(params => 
      {
        this.triedToSave = false;
        this.userBioData = null;
        this.username = params.get('username');
        this.loadAdoptedPlans();
        this.loadOrInitializeWorkout(params.get('id'));
      });
  }

  loadOrInitializeWorkout(id: string) {
    if (id) {
      this.service.getWorkout(id).subscribe(workout => {
        if (workout.user.username == this.authService.getUsername()) {
          this.workout = workout;
        }
      });
    }
    else {
      this.workout = new Workout();
      this.workout.start = new Date();

      this.setNextActivityInProgress();

      this.service.getLastWorkout(this.username, null, null, new Date()).subscribe(w =>
        {
          if (w.working_weights) {
            for (const workingWeight of w.working_weights) {
              delete workingWeight.id;
            }
            this.workout.working_weights = w.working_weights;
          }
          this.previousWorkout = w;
        });
    }
  }

  loadAdoptedPlans() {
    this.plansService.getAdoptedPlans(this.username).subscribe(plans => 
      {
        this.adoptedPlans = plans;
        if (this.workout && this.workout.plan) {
          this.planSessions = this.adoptedPlans
            .filter(plan => plan.id == this.workout.plan)
            .map(plan => plan.sessions)[0];
        }
        else {
          this.planSessions = this.adoptedPlans
            .map(plan => plan.sessions)[0];
        }
      });
  }

  planChanged() {
    if (this.workout.plan) {
      if (this.adoptedPlans) {
        this.planSessions = this.adoptedPlans
          .filter(plan => plan.id == this.workout.plan)
          .map(plan => plan.sessions)[0];
      }

      if (!this.workout.id && this.planSessions && this.planSessions.length > 0) {
        if (this.previousWorkout && this.previousWorkout.plan == this.workout.plan) {
          this.selectNextPlanSession(this.previousWorkout);
        }
        else {
          this.service.getLastWorkout(this.username, this.workout.plan, null, new Date()).subscribe(w => {
            this.selectNextPlanSession(w);
          });
        }
      }
    }
  }

  selectNextPlanSession(previousPlanWorkout: Workout): void {
    let selectNextPlanSession = false;

    for (let ps of this.planSessions) {
      if (selectNextPlanSession) {
        this.workout.plan_session = ps.id;
        selectNextPlanSession = false;

        break;
      }

      if (ps.id == previousPlanWorkout.plan_session) {
        selectNextPlanSession = true;
      }
    }

    if (selectNextPlanSession) {
      this.workout.plan_session = this.planSessions[0].id;
    }

    this.sessionChanged();
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

  showUserBioData() {
    this.userBioDataVisible = true;    
  }

  onUserBioDataClosed() {
    this.userBioDataVisible = false;
  }

  onUserBioDataOkayed(event: any) {
    this.userBioData = event;
  }

  sessionChanged() {
    let plan = this.adoptedPlans.filter(x => x.id == this.workout.plan)[0];
    let planSession = this.planSessions.filter(x => x.id == this.workout.plan_session)[0];

    if (plan && planSession && (this.workout.id == null || this.workout.id <= 0)) {
      this.workoutGeneratorService.generate(this.workout.start, this.workout.working_weights, plan, planSession)
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

    this.saveObservable().subscribe(workout => {
      this.triedToSave = false;
      this.workout = workout;
    });
  }

  saveObservable(): Observable<Workout> {
    let userBioDataObservable: Observable<UserBioData>;
    let saveWorkoutObservable: Observable<Workout>;

    saveWorkoutObservable = this.service.saveWorkout(this.workout);

    if (this.userBioData) {
      userBioDataObservable = this.userBioDataService.saveUserBioData(this.userBioData);
    }

    if (userBioDataObservable) {
      return userBioDataObservable.pipe(concatMap(ubd => saveWorkoutObservable));
    }

    return saveWorkoutObservable;
  }

  navigateToWorkoutList(): void {
    this.router.navigate(['/users', this.authService.getUsername(), 'workouts'], {
      relativeTo: this.route,
    });
  }

  onWorkingWeightsClosed() {
    this.workingWeightsVisible = false;
    this.workoutGeneratorService.updateWeights(this.workout, this.workout.working_weights);
  }

  valid(workout: Workout): boolean {
    if (!workout.start) {
      return false;
    }

    return true;
  }

  validFinishedWorkout(workout: Workout): boolean {
    if (!this.valid(workout)) {
      return false;
    }

    if (!workout.end) {
      return false;
    }

    return true;
  }

  validWorkingWeights(workingWeights: WorkingWeight[]): boolean {
    if (workingWeights) {
      for(let workingWeight of workingWeights) {
        if (!workingWeight.exercise) {
          return false;
        }
      }
    }

    return true;
  }

  finishWorkout(): void {
    this.workout.status = WorkoutStatus.Finished;
    this.triedToSave = true;

    if (!this.validFinishedWorkout(this.workout)) {
      return;
    }

    this.saveObservable().subscribe(workout => {
      this.triedToSave = false;
      this.workout = workout;
      this.navigateToWorkoutList();
    });
  }

  showFinishWorkoutModal(): void {
    this.workout.end = new Date();

    this.finishWorkoutVisible = true;
  }

  hideFinishWorkout(): void {
    this.finishWorkoutVisible = false;
  }
}
