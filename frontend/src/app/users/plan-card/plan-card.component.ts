import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Plan } from '../plan';
import { PlansService } from '../plans.service';
import { AuthService } from 'src/app/auth.service';
import { faChild, faExternalLinkAlt, faCircleNotch, faTimes, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { RepetitionType, PlanSessionGroupActivity, Vo2MaxType, SpeedType, DistanceType, TimeType } from '../plan-session-group-activity';
import { PlanSession } from '../plan-session';
import { Exercise } from '../exercise';
import { PlanSessionGroup } from '../plan-session-group';
import { UnitsService } from '../units.service';
import { Unit } from '../unit';
import { ParameterType } from '../plan-progression-strategy';
import { Router } from '@angular/router';
import { LanguageService } from 'src/app/language.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-plan-card',
  templateUrl: './plan-card.component.html',
  styleUrls: ['./plan-card.component.css']
})
export class PlanCardComponent implements OnInit, OnDestroy {
  @Input() plan: Plan;
  @Input() id: number;
  @Input() showSaveDeleteButtons: boolean = false;
  @Input() commentsSectionOpen: boolean = false;
  @Input() detailView: boolean;
  @Output() deleted = new EventEmitter();
  @Output() adopted = new EventEmitter();
  @Output() left = new EventEmitter();

  showAdoptButton: boolean = false;
  showLeaveButton: boolean = false;
  routerLink: any;
  shareTitle: string;
  shareLink: string;

  deleteModalVisible: boolean = false;

  repetitionType = RepetitionType;
  speedType = SpeedType;
  distanceType = DistanceType;
  timeType = TimeType;
  vo2MaxType = Vo2MaxType;
  parameterType = ParameterType;

  faChild = faChild;
  faMinusCircle = faMinusCircle;
  faExternalLinkAlt = faExternalLinkAlt;
  faCircleNotch = faCircleNotch;

  adopting: boolean = false;
  leaving: boolean = false;
  deleting: boolean = false;
  units: Unit[];

  languageChangedSubscription: Subscription;

  constructor(
    private languageService: LanguageService,
    private translate: TranslateService,
    private plansService: PlansService,
    private authService: AuthService,
    private unitsService: UnitsService,
    private router: Router,
  ) {
    this.languageChangedSubscription = languageService.languageChanged.subscribe(x => {
      this.updateShareTitle(this.plan);
    });
   }

  ngOnDestroy(): void {
    this.languageChangedSubscription.unsubscribe();
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  getUnitCode(unit: number): string {
    return this.unitsService.getUnitCode(unit);
  }

  ngOnInit() {
    this.unitsService.getUnits().subscribe(units => this.units = units);
      
    this.deleteModalVisible = false;
    this.deleting = false;
    this.adopting = false;

    if (!this.plan) {
      this.plansService.getPlan(this.id).subscribe(w =>
        {
          this.plan = w;
          this.setupPlan(this.plan);
        });
    }
    else {
      this.setupPlan(this.plan);
    }
  }

  private setupPlan(p: Plan) {
    if (!p) {
      return;
    }
    this.routerLink = ['/users', p.user.username, 'plan', p.id];
    this.setAdoptButtonVisibility();
    this.unitsService.convertPlan(p);
    this.updateShareTitle(p);
    this.shareLink = window.location.origin.replace('android.', 'www.') + this.router.createUrlTree(this.routerLink);
  }

  updateShareTitle(p: Plan) {
    if (p) {
      this.translate.get('sukuwatto: {{plan_name}} workout plan', {plan_name: p.name}).subscribe(res => {
        this.shareTitle = res;
      });
    }
  }

  delete() {
    this.deleteModalVisible = false;
    this.deleting = true;
    this.deleted.emit(this.plan);
  }

  adopt() {
    this.adopting = true;
    this.plansService.adoptPlan(this.plan).subscribe(savedPlan =>
      {
        if (savedPlan && savedPlan.id && savedPlan.id > 0)
        {
          this.adopting = false;
          this.adopted.emit(this.plan);
        }
      });
  }

  leave() {
    this.leaving = true;
    this.plansService.leavePlan(this.plan).subscribe(savedPlan =>
      {
        this.leaving = false;
        this.left.emit(this.plan);
      });
  }

  setAdoptButtonVisibility() {
    if (this.authService.isLoggedIn()) {
      this.plansService.isAdopted(this.plan.id, +this.authService.getUserId()).subscribe(itIs => {
        if (itIs) {
          this.showAdoptButton = false;
          this.showLeaveButton = true;
        }
        else {
          this.showAdoptButton = true;
          this.showLeaveButton = false;
        }
      });
    }
    else {
      this.showAdoptButton = false;
      this.showLeaveButton = false;
    }
  }

  toggleDeleteModal() {
    this.deleteModalVisible = !this.deleteModalVisible;
  }

  getActivities(session: PlanSession): PlanSessionGroupActivity[] {
    return ([] as PlanSessionGroupActivity[]).concat(...session.groups.map(x => x.exercises));
  }

  getDistinct(session: PlanSession, exercise: Exercise, callbackfn: (value: PlanSessionGroupActivity) => number) {
    return new Set(this.getActivities(session).filter(x => x.exercise.id == exercise.id).map(x => callbackfn(x)));
  }

  multipleWorkingWeightsForExercise(session: PlanSession, exercise: Exercise): boolean {
    return this.getDistinct(session, exercise, x => x.working_weight_percentage).size > 1;
  }

  multipleWorkingDistancesForExercise(session: PlanSession, exercise: Exercise): boolean {
    return this.getDistinct(session, exercise, x => x.working_distance_percentage).size > 1;
  }

  multipleWorkingSpeedsForExercise(session: PlanSession, exercise: Exercise): boolean {
    return this.getDistinct(session, exercise, x => x.working_speed_percentage).size > 1;
  }

  multipleWorkingTimesForExercise(session: PlanSession, exercise: Exercise): boolean {
    return this.getDistinct(session, exercise, x => x.working_time_percentage).size > 1;
  }

  getGroupOrders(session: PlanSession) {
    return new Set(session.groups.map(g => g.order).sort((a,b) => a - b));
  }

  getExerciseOrders(group: PlanSessionGroup) {
    return new Set(group.exercises.map(e => e.order).sort((a,b) => a - b));
  }

  getGroups(session: PlanSession, group_order: number): PlanSessionGroup[] {
    return session.groups.filter(g => g.order == group_order);
  }

  hasGroupsWithMoreThanOneExercise(session: PlanSession, group_order: number): boolean {
    return this.getGroups(session, group_order).filter(g => g.exercises.length > 1).length > 0;
  }

  getExercises(group: PlanSessionGroup, exercise_order: number): PlanSessionGroupActivity[] {
    return group.exercises.filter(e => e.order == exercise_order);
  }

  showWorkingPercentage(session, exercise, percentage) {
    return percentage &&
          (percentage != 100 ||
          this.multipleWorkingWeightsForExercise(session, exercise));
  }

  showParameterBlock(session, activity: PlanSessionGroupActivity, type: ParameterType) {
    let parameter;
    let parameter_type_filled = false;
    let percentage;

    switch(type) {
      case ParameterType.Distance:
        parameter= activity.distance;
        parameter_type_filled = activity.distance_type != this.distanceType.None;
        percentage = activity.working_distance_percentage;
        break;
      case ParameterType.Speed:
        parameter= activity.speed;
        parameter_type_filled = activity.speed_type != this.speedType.None;
        percentage = activity.working_speed_percentage;
        break;
      case ParameterType.Time:
        parameter= activity.time;
        parameter_type_filled = activity.time_type != this.timeType.None;
        percentage = activity.working_time_percentage;
        break;
    }

    return parameter || (parameter_type_filled && this.showWorkingPercentage(session, activity.exercise, percentage));
  }
}
