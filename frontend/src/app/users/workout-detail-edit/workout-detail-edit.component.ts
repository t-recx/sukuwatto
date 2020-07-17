import { Component, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { Workout, WorkoutStatus } from '../workout';
import { Plan } from '../plan';
import { WorkoutsService } from '../workouts.service';
import { PlansService } from '../plans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanSession } from '../plan-session';
import { WorkoutGroup } from '../workout-group';
import { WorkoutGeneratorService } from '../workout-generator.service';
import { WorkoutSet } from '../workout-set';
import { Subject, Observable, Subscription } from 'rxjs';
import { WorkingParameter } from '../working-parameter';
import { UserBioData } from '../user-bio-data';
import { UserBioDataService } from '../user-bio-data.service';
import { concatMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { Location } from '@angular/common';
import { AlertService } from 'src/app/alert/alert.service';
import { faCircleNotch, faSave, faTrash, faCheckSquare, faLayerGroup, faWeight, faWeightHanging, faBook, faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { CordovaService } from 'src/app/cordova.service';
import { SerializerUtilsService } from 'src/app/serializer-utils.service';

@Component({
  selector: 'app-workout-detail-edit',
  templateUrl: './workout-detail-edit.component.html',
  styleUrls: ['./workout-detail-edit.component.css']
})
export class WorkoutDetailEditComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() quickActivity: boolean = false;
  pausedSubscription: Subscription;
  finishGeolocationActivities: Subscription;

  ngAfterViewInit(): void {
    this.serializerUtils.restoreScrollPosition();
  }

  stateHasStateId = 'state_workout_detail_has_state';
  stateWorkoutId = 'state_workout_detail_workout';
  statePreviousWorkoutId = 'state_workout_detail_previous_workout';
  stateNotesVisibilityId = 'state_workout_detail_notes_visibility';
  stateAdoptedPlansId = 'state_workout_detail_adopted_plans';
  statePlanSessionsId = 'state_workout_detail_plan_sessions';
  stateWorkingParametersVisibleId = 'state_workout_detail_working_parameters_visible';
  stateUserBioDataVisibleId = 'state_workout_detail_user_bio_data_visible';
  stateFinishWorkoutVisibleId = 'state_workout_detail_finish_workout_visible';
  stateUsernameId = 'state_workout_detail_username';
  stateDeleteModalVisibleId = 'state_workout_detail_delete_modal_visible';

  ngOnDestroy(): void {
    this.pausedSubscription.unsubscribe();
    this.finishGeolocationActivities.unsubscribe();

    localStorage.removeItem(this.stateWorkoutId);
    localStorage.removeItem(this.statePreviousWorkoutId);
    localStorage.removeItem(this.stateNotesVisibilityId);
    localStorage.removeItem(this.stateAdoptedPlansId);
    localStorage.removeItem(this.statePlanSessionsId);
    localStorage.removeItem(this.stateWorkingParametersVisibleId);
    localStorage.removeItem(this.stateUserBioDataVisibleId);
    localStorage.removeItem(this.stateFinishWorkoutVisibleId);
    localStorage.removeItem(this.stateUsernameId);
    localStorage.removeItem(this.stateDeleteModalVisibleId);
    localStorage.removeItem(this.stateHasStateId);

    this.serializerUtils.removeScrollPosition();
  }

  serialize() {
    const warmups = this.workout.groups.flatMap(g => g.warmups ?? []);
    const sets = this.workout.groups.flatMap(g => g.sets ?? []);

    [...warmups, ...sets].filter(x => x.collectingPositions).map(x => {
      x.suspended = true;
    });

    [...warmups, ...sets].filter(x => !x.collectingPositions).map(x => {
      x.suspended = false;
    });

    localStorage.setItem(this.stateHasStateId, JSON.stringify(true));
    localStorage.setItem(this.stateWorkoutId, JSON.stringify(this.workout));
    localStorage.setItem(this.statePreviousWorkoutId, JSON.stringify(this.previousWorkout));
    localStorage.setItem(this.stateNotesVisibilityId, JSON.stringify(this.notesVisibility));
    localStorage.setItem(this.stateAdoptedPlansId, JSON.stringify(this.adoptedPlans));
    localStorage.setItem(this.statePlanSessionsId, JSON.stringify(this.planSessions));
    localStorage.setItem(this.stateWorkingParametersVisibleId, JSON.stringify(this.workingParametersVisible));
    localStorage.setItem(this.stateUserBioDataVisibleId, JSON.stringify(this.userBioDataVisible));
    localStorage.setItem(this.stateFinishWorkoutVisibleId, JSON.stringify(this.finishWorkoutVisible));
    localStorage.setItem(this.stateUsernameId, JSON.stringify(this.username));
    localStorage.setItem(this.stateDeleteModalVisibleId, JSON.stringify(this.deleteModalVisible));

    this.serializerUtils.serializeScrollPosition();
  }

  restore(): boolean {
    const hasState = JSON.parse(localStorage.getItem(this.stateHasStateId));

    if (!hasState) {
      return false;
    }

    const stateWorkout = localStorage.getItem(this.stateWorkoutId);
    const statePreviousWorkout = localStorage.getItem(this.statePreviousWorkoutId);
    const stateNotesVisibility = localStorage.getItem(this.stateNotesVisibilityId);
    const stateAdoptedPlans = localStorage.getItem(this.stateAdoptedPlansId);
    const statePlanSessions = localStorage.getItem(this.statePlanSessionsId);
    const stateWorkingParametersVisible = localStorage.getItem(this.stateWorkingParametersVisibleId);
    const stateUserBioDataVisible = localStorage.getItem(this.stateUserBioDataVisibleId);
    const stateFinishWorkoutVisible = localStorage.getItem(this.stateFinishWorkoutVisibleId);
    const stateUsername = localStorage.getItem(this.stateUsernameId);
    const stateDeleteModalVisible = localStorage.getItem(this.stateDeleteModalVisibleId);

    this.workout = this.service.getProperlyTypedWorkout(JSON.parse(stateWorkout));
    this.previousWorkout = this.service.getProperlyTypedWorkout(JSON.parse(statePreviousWorkout));
    this.notesVisibility = JSON.parse(stateNotesVisibility);
    this.adoptedPlans = this.plansService.getProperlyTypedPlans(JSON.parse(stateAdoptedPlans));
    this.planSessions = this.plansService.getProperlyTypedPlanSessions(JSON.parse(statePlanSessions));
    this.workingParametersVisible = JSON.parse(stateWorkingParametersVisible);
    this.userBioDataVisible = JSON.parse(stateUserBioDataVisible);
    this.finishWorkoutVisible = JSON.parse(stateFinishWorkoutVisible);
    this.username = JSON.parse(stateUsername);
    this.deleteModalVisible = JSON.parse(stateDeleteModalVisible);

    return true;
  }

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
    private cordovaService: CordovaService,
    private serializerUtils: SerializerUtilsService,
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

    this.route.paramMap.subscribe(params => this.loadViewData(params.get('username'), params.get('id')));
    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.serialize()) ;
    this.finishGeolocationActivities = this.service.geolocationActivitiesFinished.subscribe(() => {
      if (this.quickActivity) {
        this.showFinishWorkoutModal();
      }
    });
  }

  loadViewData(username: string, id: string) {
    this.saving = this.deleting = this.finishing = false;
    this.triedToSave = false;
    this.userBioData = null;
    this.username = username;

    if (this.restore()) {
      return;
    }

    this.loadAdoptedPlans();
    this.loadOrInitializeWorkout(id);
  }

  newActivity() {
    let activity = new WorkoutSet();

    activity.editing = true;
    activity.quick = true;

    if (!this.workout.groups[0].sets) {
      this.workout.groups[0].sets = [];
    }

    this.workout.groups[0].sets.push(activity);
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

      if (this.quickActivity) {
        this.newActivity();
      }

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
            if (w && w.id) {
              this.selectNextPlanSession(w);
            }
            else {
              this.workout.plan_session = this.planSessions[0].id;
              this.sessionChanged();
            }
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
      const numberWorkingParameters = (this.workout.working_parameters ?? []).length;

      this.workoutGeneratorService.generate(this.workout.start, this.workout.working_parameters, plan, planSession)
      .subscribe(newWorkout => { 
        this.workout = newWorkout; 
        this.setNextActivityInProgress();

        if (newWorkout.working_parameters &&
            newWorkout.working_parameters.length > numberWorkingParameters) {
          this.showWorkingParameters();
        }
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
      this.finishWorkoutVisible = false;
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
