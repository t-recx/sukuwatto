import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Plan } from '../plan';
import { PlansService } from '../plans.service';
import { AuthService } from 'src/app/auth.service';
import { faChild } from '@fortawesome/free-solid-svg-icons';
import { RepetitionType, PlanSessionGroupActivity } from '../plan-session-group-activity';
import { PlanSession } from '../plan-session';
import { Exercise } from '../exercise';

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

  constructor(
    private plansService: PlansService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.deleteModalVisible = false;
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
    this.deleted.emit(this.plan);
  }

  adopt() {
    this.plansService.adoptPlan(this.plan).subscribe(savedPlan =>
      {
        if (savedPlan && savedPlan.id && savedPlan.id > 0)
        {
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

  multipleWorkingWeightsForExercise(session: PlanSession, exercise: Exercise): boolean {
    let distinct = new Set(this.getActivities(session).filter(x => x.exercise.id == exercise.id).map(x => x.working_weight_percentage));

    return distinct.size > 1;
  }
}
