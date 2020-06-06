import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Plan } from '../plan';
import { PlansService } from '../plans.service';
import { AuthService } from 'src/app/auth.service';
import { faChild, faExternalLinkAlt, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { RepetitionType, PlanSessionGroupActivity } from '../plan-session-group-activity';
import { PlanSession } from '../plan-session';
import { Exercise } from '../exercise';
import { PlanSessionGroup } from '../plan-session-group';

@Component({
  selector: 'app-plan-card',
  templateUrl: './plan-card.component.html',
  styleUrls: ['./plan-card.component.css']
})
export class PlanCardComponent implements OnInit {
  @Input() plan: Plan;
  @Input() id: number;
  @Input() showSaveDeleteButtons: boolean = false;
  @Output() deleted = new EventEmitter();
  @Output() adopted = new EventEmitter();

  showAdoptButton: boolean = false;
  deleteModalVisible: boolean = false;

  repetitionType = RepetitionType;
  faChild = faChild;
  faExternalLinkAlt = faExternalLinkAlt;
  faCircleNotch = faCircleNotch;

  adopting: boolean = false;
  deleting: boolean = false;

  constructor(
    private plansService: PlansService,
    private authService: AuthService,
  ) { }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.deleteModalVisible = false;
    this.deleting = false;
    this.adopting = false;
    if (!this.plan) {
      this.plansService.getPlan(this.id).subscribe(w =>
        {
          this.plan = w;
          this.setAdoptButtonVisibility();
        });
    }
    else {
      this.setAdoptButtonVisibility();
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

  setAdoptButtonVisibility() {
    this.showAdoptButton = !this.authService.isCurrentUserLoggedIn(this.plan.user.username);
  }

  toggleDeleteModal() {
    this.deleteModalVisible = !this.deleteModalVisible;
  }

  getActivities(session: PlanSession): PlanSessionGroupActivity[] {
    return ([] as PlanSessionGroupActivity[]).concat(...session.groups.map(x => x.exercises));
  }

  multipleWorkingParametersForExercise(session: PlanSession, exercise: Exercise): boolean {
    let distinct = new Set(this.getActivities(session).filter(x => x.exercise.id == exercise.id).map(x => x.working_parameter_percentage));

    return distinct.size > 1;
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

  getPlanWebsite() {
    let website = this.plan.website;

    if (!website.startsWith('http')) {
      website = 'http://' + website;
    }

    return website;
  }
}
