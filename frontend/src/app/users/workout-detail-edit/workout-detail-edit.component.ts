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
import { WorkingParameter } from '../working-parameter';
import { UserBioData } from '../user-bio-data';
import { UserBioDataService } from '../user-bio-data.service';
import { concatMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { Location } from '@angular/common';
import { AlertService } from 'src/app/alert/alert.service';
import { faCircleNotch, faSave, faTrash, faCheckSquare, faLayerGroup, faWeight, faWeightHanging, faBook, faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-workout-detail-edit',
  templateUrl: './workout-detail-edit.component.html',
  styleUrls: ['./workout-detail-edit.component.css']
})
export class WorkoutDetailEditComponent implements OnInit {
  workout: Workout;
  previousWorkout: Workout;

  notesVisibility: boolean = false;

  faCircleNotch = faCircleNotch;
  faSave = faSave;
  faTrash = faTrash;
  faCheckSquare = faCheckSquare;
  faLayerGroup = faLayerGroup;
  faWeightHanging = faWeightHanging;
  faWeight = faWeight;
  faBook = faBook;
  faBookOpen = faBookOpen;

  adoptedPlans: Plan[];
  planSessions: PlanSession[];
  triedToSave: boolean;
  workingParametersVisible: boolean = false;
  userBioDataVisible: boolean = false;
  userBioData: UserBioData = null;
  finishWorkoutVisible: boolean = false;
  username: string;

  activityStatusChangedSubject: Subject<void> = new Subject<void>();

  deleteModalVisible: boolean = false;

  loading: boolean = false;
  saving: boolean = false;
  finishing: boolean = false;
  deleting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private service: WorkoutsService,
    private userBioDataService: UserBioDataService,
    private plansService: PlansService,
    private router: Router,
    private workoutGeneratorService: WorkoutGeneratorService,
    private authService: AuthService,
    private location: Location,
    private alertService: AlertService,
    private loadingService: LoadingService,
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
          let date: Date = new Date();

          if (this.workout.start) {
              date = new Date(this.workout.start);
          }

          this.workout.start = this.getDate(date, event);
      }
  }

  getDate(date: Date, timeString: string) : Date {
      let year = date.getFullYear();
      let month = date.getMonth();
      let day = date.getDate();
      let hour = +timeString.substr(0, 2);
      let minute = +timeString.substr(3, 2);

      return new Date(year, month, day, hour, minute);
  }

  ngOnInit() {
    this.triedToSave = false;
    this.userBioData = null;
    this.deleteModalVisible = false;

    this.route.paramMap.subscribe(params => 
      {
        this.saving = this.deleting = this.finishing = false;
        this.triedToSave = false;
        this.userBioData = null;
        this.username = params.get('username');
        this.loadAdoptedPlans();
        this.loadOrInitializeWorkout(params.get('id'));
      });
  }

  loadOrInitializeWorkout(id: string) {
    if (id) {
      this.loading = true;
      this.loadingService.load();
      this.service.getWorkout(id).subscribe(workout => {
        if (workout.user.username == this.authService.getUsername()) {
          this.workout = workout;
        }
        this.notesVisibility = workout.notes && workout.notes.length > 0;
        this.loading = false;
        this.loadingService.unload();
      });
    }
    else {
      this.workout = new Workout();
      this.workout.plan = null;
      this.workout.plan_session = null;
      this.workout.start = new Date();
      this.workout.name = this.workoutGeneratorService.getWorkoutName(this.workout.start, null);

      this.newGroup();

      this.setNextActivityInProgress();

      this.loading = true;
      this.loadingService.load();
      this.service.getLastWorkout(this.username, null, null, new Date()).subscribe(w =>
        {
          if (w.working_parameters) {
            for (const workingParameter of w.working_parameters) {
              delete workingParameter.id;
              workingParameter.manually_changed = false;
            }
            this.workout.working_parameters = w.working_parameters;
          }
          this.previousWorkout = w;

          this.loading = false;
          this.loadingService.unload();
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

  hasAlternativeGroups(group: WorkoutGroup): boolean {
    if (this.workout.plan && this.workout.plan_session && this.planSessions) {
      if (group.plan_session_group) {
        let planSession = this.planSessions.filter(s => s.id == this.workout.plan_session)[0];

        if (planSession) {
          let planSessionGroup = planSession.groups.filter(g => g.id == group.plan_session_group)[0];

          if (planSessionGroup) {
            return planSession.groups.filter(o => o.order == planSessionGroup.order).length > 1;
          }
        }
      }
    }

    return false;
  }

  alternateGroup(group: WorkoutGroup): void {
    let plan = this.adoptedPlans.filter(x => x.id == this.workout.plan)[0];
    let planSession = this.planSessions.filter(x => x.id == this.workout.plan_session)[0];

    if (plan && planSession) {
      this.workoutGeneratorService.alternateGroupOnWorkout(this.workout, plan, planSession, group).subscribe(() => {});
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

  showWorkingParameters() {
    this.workingParametersVisible = true;    
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
      this.workoutGeneratorService.generate(this.workout.start, this.workout.working_parameters, plan, planSession)
      .subscribe(newWorkout => { 
        this.workout = newWorkout; 
        this.setNextActivityInProgress();
      });
    }
  }

  toggleNotesVisibility() {
    this.notesVisibility = !this.notesVisibility;
  }

  newGroup() {
    let newGroup = new WorkoutGroup();

    if (this.workout.plan_session && this.workout.groups.length > 0) {
      newGroup.name = "Additional exercises";
    }
    else {
      newGroup.name = "Exercises";
    }

    this.workout.groups.push(newGroup);
  }

  save() {
    this.triedToSave = true;

    if (!this.valid(this.workout)) {
      this.alertService.warn('Please fill all required fields and try again');
      return;
    }

    this.saving = true;
    this.saveObservable().subscribe(workout => {
      this.saving = false;
      this.triedToSave = false;

      if (workout) {
        this.workout = workout;

        if (this.workout.id) {
          this.location
          .replaceState('/users/' + this.authService.getUsername() + '/workout/' + this.workout.id.toString());
        } 

        this.alertService.success('Workout saved successfully');
      }
    });
  }

  saveObservable(): Observable<Workout> {
    let userBioDataObservable: Observable<UserBioData>;
    let saveWorkoutObservable: Observable<Workout>;

    this.setCalories();

    if (!this.workout.name || this.workout.name.trim().length == 0) {
      this.workout.name = this.workoutGeneratorService.getWorkoutName(this.workout.start, null);
    }

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

  onWorkingParametersClosed() {
    this.workingParametersVisible = false;
    this.workoutGeneratorService.updateValues(this.workout, this.workout.working_parameters);
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

  validWorkingParameters(workingParameters: WorkingParameter[]): boolean {
    if (workingParameters) {
      for(let workingParameter of workingParameters) {
        if (!workingParameter.exercise) {
          return false;
        }
      }
    }

    return true;
  }

  setCalories(): void {
    const warmups = this.workout.groups.flatMap(w => w.warmups.map(s => s)) ?? [];
    const sets = this.workout.groups.flatMap(w => w.sets.map(s => s)) ?? [];

    const activities = [...warmups, ...sets];

    this.workout.calories =  activities.reduce((a, b) => a + b.calories, 0);
  }

  finishWorkout(): void {
    this.workout.status = WorkoutStatus.Finished;
    this.triedToSave = true;

    if (!this.validFinishedWorkout(this.workout)) {
      this.alertService.warn('Please fill all required fields and try again');
      return;
    }

    this.finishing = true;
    this.saveObservable().subscribe(workout => {
      this.finishWorkoutVisible = false;
      this.finishing = false;
      this.triedToSave = false;
      if (workout) {
        this.workout = workout;
        this.navigateToWorkoutList();
      }
    });
  }

  showFinishWorkoutModal(): void {
    let now = new Date();

    if (this.workout.start) {
      this.workout.start = new Date(this.workout.start);

      if (this.workout.start.getFullYear() == now.getFullYear() && this.workout.start.getMonth() == now.getMonth() && this.workout.start.getDate() == now.getDate()) {
        this.workout.end = now;
      }
      else {
        this.workout.end = this.workout.start;
      }
    }

    this.finishWorkoutVisible = true;
  }

  hideFinishWorkout(): void {
    this.finishWorkoutVisible = false;
  }

  toggleDeleteModal(): void {
    this.deleteModalVisible = !this.deleteModalVisible;
  }

  delete(): void {
    this.deleting = true;
    this.service.deleteWorkout(this.workout).subscribe(_ => {
      this.deleting = false;
      this.navigateToWorkoutList();
    });
  }
}
