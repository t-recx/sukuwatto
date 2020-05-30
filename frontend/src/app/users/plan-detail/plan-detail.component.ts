import { Component, OnInit } from '@angular/core';
import { PlansService } from '../plans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Plan } from '../plan';
import { faCalendarPlus, faTimesCircle, faSave, faTrash, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { PlanSession } from '../plan-session';
import { AuthService } from 'src/app/auth.service';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.css']
})
export class PlanDetailComponent implements OnInit {
  faCalendarPlus = faCalendarPlus;
  faTimesCircle = faTimesCircle;

  faSave = faSave;
  faTrash = faTrash;
  faCircleNotch = faCircleNotch;

  plan: Plan;
  selectedSession: PlanSession;
  triedToSave: boolean = false;

  deleteModalVisible: boolean = false;

  userIsOwner: boolean = false;

  saving: boolean = false;
  deleting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private service: PlansService,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => 
      {
        this.triedToSave = false;
        this.loadOrInitializePlan(params.get('id'));
      });
  }

  private loadOrInitializePlan(id: string) {
    if (id) {
      this.service.getPlan(id).subscribe(plan => {
        this.plan = plan;
        this.userIsOwner = this.authService.isCurrentUserLoggedIn(this.plan.user.username);
        if (this.plan.sessions && this.plan.sessions.length > 0) {
          this.selectedSession = this.plan.sessions[0];
        }
      });
    }
    else {
      this.plan = new Plan();
      this.userIsOwner = true;
    }
  }

  addSession() {
    let newSession = new PlanSession();
    newSession.name = "New Session";

    this.plan.sessions.push(newSession);
    this.selectedSession = newSession;
  }

  selectSession(session) {
    this.selectedSession = session;
  }

  removeSession(session) {
    const index = this.plan.sessions.indexOf(session, 0);
    if (index > -1) {
      this.plan.sessions.splice(index, 1);

      if (index > 0) {
        this.selectedSession = this.plan.sessions[index - 1];
      }
      else if (index == 0 && this.plan.sessions.length > 0) {
        this.selectedSession = this.plan.sessions[0];
      }
    }
  }

  save() {
    this.triedToSave = true;

    if (!this.service.valid(this.plan)) {
      this.alertService.warn('Please fill all required fields and try again');
      return;
    }

    this.saving = true;
    this.service.savePlan(this.plan).subscribe(plan => {
      this.saving = false;
      this.triedToSave = false;

      if (plan) {
        this.goBackToList();
      }
    });
  }

  goBackToList() {
    this.router.navigate(['/users', this.authService.getUsername(), 'plans'], {
      relativeTo: this.route,
    });
  }

  toggleDeleteModal() {
    this.deleteModalVisible = !this.deleteModalVisible;
  }

  delete() {
    this.deleting = true;
    this.service.deletePlan(this.plan).subscribe(x => 
      {
        this.deleting = false;
        this.goBackToList();
      });
  }
}
