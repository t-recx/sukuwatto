import { Component, OnInit, OnDestroy, HostListener, AfterViewInit } from '@angular/core';
import { PlansService } from '../plans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Plan } from '../plan';
import { faCalendarPlus, faTimesCircle, faSave, faTrash, faCircleNotch, faAudioDescription, faChild } from '@fortawesome/free-solid-svg-icons';
import { PlanSession } from '../plan-session';
import { AuthService } from 'src/app/auth.service';
import { AlertService } from 'src/app/alert/alert.service';
import { LoadingService } from '../loading.service';
import { CordovaService } from 'src/app/cordova.service';
import { Subscription } from 'rxjs';
import { SerializerUtilsService } from 'src/app/serializer-utils.service';

@Component({
  selector: 'app-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.css']
})
export class PlanDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  faCalendarPlus = faCalendarPlus;
  faTimesCircle = faTimesCircle;

  faSave = faSave;
  faAdopt = faChild;
  faTrash = faTrash;
  faCircleNotch = faCircleNotch;

  plan: Plan;
  selectedSession: PlanSession;
  triedToSave: boolean = false;

  deleteModalVisible: boolean = false;

  userIsOwner: boolean = false;

  loading: boolean = false;
  saving: boolean = false;
  savingAndAdopting: boolean = false;
  deleting: boolean = false;

  pausedSubscription: Subscription;
  resumedSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private service: PlansService,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private loadingService: LoadingService,
    private cordovaService: CordovaService,
    private serializerUtils: SerializerUtilsService,
  ) { }

  ngAfterViewInit(): void {
    this.serializerUtils.restoreScrollPosition();
  }

  ngOnInit() {
    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.serialize());
    //this.resumedSubscription = this.cordovaService.paused.subscribe(() => this.restore());

    this.route.paramMap.subscribe(params => {
      this.triedToSave = false;
      this.loadOrInitializePlan(params.get('id'));
    });
  }

  ngOnDestroy(): void {
    this.pausedSubscription.unsubscribe();
    //this.resumedSubscription.unsubscribe();

    localStorage.removeItem('state_plan_detail_has_state');
    localStorage.removeItem('state_plan_detail_selected_session_index');
    localStorage.removeItem('state_plan_detail_plan');
    this.serializerUtils.removeScrollPosition();
  }

  getSelectedSessionIndex(): number {
    if (!this.plan || !this.plan.sessions || this.plan.sessions.length == 0 || !this.selectedSession) {
      return 0;
    }

    for (let index = 0; index < this.plan.sessions.length; index++) {
      const element = this.plan.sessions[index];

      if (this.selectedSession == element) {
        return index;
      }
    }

    return 0;
  }

  serialize() {
    localStorage.setItem('state_plan_detail_has_state', JSON.stringify(true));
    localStorage.setItem('state_plan_detail_plan', JSON.stringify(this.plan));
    localStorage.setItem('state_plan_detail_selected_session_index', JSON.stringify(this.getSelectedSessionIndex()));
    this.serializerUtils.serializeScrollPosition();
  }

  restore(): boolean {
    const hasState = JSON.parse(localStorage.getItem('state_plan_detail_has_state'));

    if (!hasState) {
      return false;
    }

    const state = localStorage.getItem('state_plan_detail_plan');
    const sessionIndex = JSON.parse(localStorage.getItem('state_plan_detail_selected_session_index'));

    this.plan = this.service.getProperlyTypedPlan(JSON.parse(state));

    if (this.plan.id && this.plan.id > 0) {
      this.userIsOwner = this.authService.isCurrentUserLoggedIn(this.plan.user.username);
    }
    else {
      this.userIsOwner = true;
    }

    if (this.plan.sessions && this.plan.sessions.length > 0) {
      if (sessionIndex && sessionIndex < this.plan.sessions.length) {
        this.selectedSession = this.plan.sessions[sessionIndex];
      }
    }
    else {
      if (this.plan.sessions.length > 0) {
        this.selectedSession = this.plan.sessions[0];
      }
    }

    return true;
  }

  private loadOrInitializePlan(id: string) {
    if (this.restore()) {
      return;
    }

    if (id) {
      this.loading = true;
      this.loadingService.load();
      this.service.getPlan(id).subscribe(plan => {
        this.plan = plan;
        this.userIsOwner = this.authService.isCurrentUserLoggedIn(this.plan.user.username);
        if (this.plan.sessions && this.plan.sessions.length > 0) {
          this.selectedSession = this.plan.sessions[0];
        }
        this.loading = false;
        this.loadingService.unload();
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
        this.plan = plan;
        this.goBackToList();
      }
    });
  }

  saveAndAdopt() {
    this.triedToSave = true;

    if (!this.service.valid(this.plan)) {
      this.alertService.warn('Please fill all required fields and try again');
      return;
    }

    this.savingAndAdopting = true;
    this.service.savePlan(this.plan).subscribe(plan => {
      if (plan) {
        this.service.adoptPlan(plan).subscribe(adoptedPlan => {
          this.savingAndAdopting = false;
          this.triedToSave = false;

          if (adoptedPlan) {
            this.router.navigate(['/users', this.authService.getUsername(), 'adopted-plans'], {
              relativeTo: this.route,
            });
          }
        });
      }
    });
  }

  goBackToList() {
    this.service.isAdopted(this.plan.id, +this.authService.getUserId()).subscribe(yes => {
      if (yes) {
        this.router.navigate(['/users', this.authService.getUsername(), 'adopted-plans'], {
          relativeTo: this.route,
        });
      }
      else {
        this.router.navigate(['/users', this.authService.getUsername(), 'owned-plans'], {
          relativeTo: this.route,
        });
      }
    });
  }

  toggleDeleteModal() {
    this.deleteModalVisible = !this.deleteModalVisible;
  }

  delete() {
    this.deleting = true;
    this.service.deletePlan(this.plan).subscribe(x => {
      this.deleting = false;
      this.goBackToList();
    });
  }
}
