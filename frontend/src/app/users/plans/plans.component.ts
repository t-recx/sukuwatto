import { Component, OnInit, OnDestroy, AfterContentInit, AfterViewInit } from '@angular/core';
import { Plan } from '../plan';
import { PlansService } from '../plans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth.service';
import { LoadingService } from '../loading.service';
import { CordovaService } from 'src/app/cordova.service';
import { Subscription, forkJoin, of, Observable } from 'rxjs';
import { SerializerUtilsService } from 'src/app/serializer-utils.service';
import { UnitsService } from '../units.service';
import { catchError, tap } from 'rxjs/operators';
import { Paginated } from '../paginated';
import { ErrorService } from 'src/app/error.service';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent implements OnInit, OnDestroy, AfterViewInit {
  paginatedPlans: Paginated<Plan>;
  plans: Plan[] = [];
  adoptedPlans: Plan[] = [];
  adoptedPlansByLoggedUser: Plan[] = [];

  pageSize: number = 10;
  currentPage: number;

  username: string;
  faCalendarAlt = faCalendarAlt;

  loading: boolean = false;
  pausedSubscription: Subscription;
  paramChangedSubscription: Subscription;

  isCurrentLoggedInUser: boolean = true;

  constructor(
    private plansService: PlansService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private loadingService: LoadingService,
    private cordovaService: CordovaService,
    private unitsService: UnitsService,
    private errorService: ErrorService,
    private alertService: AlertService,
    private serializerUtils: SerializerUtilsService,
  ) {
    this.paramChangedSubscription = route.paramMap.subscribe(val =>
      {
        this.loadParameterDependentData(val.get('username'), val.get('page'));
      });
   }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.username = this.route.snapshot.paramMap.get('username');
    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.serialize());
  }

  ngAfterViewInit(): void {
    this.serializerUtils.restoreScrollPosition();
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
    this.pausedSubscription.unsubscribe();

    localStorage.removeItem('state_plans_has_state');
    localStorage.removeItem('state_plans_plans');
    localStorage.removeItem('state_plans_adopted_plans');
    this.serializerUtils.removeScrollPosition();
  }

  serialize() {
    localStorage.setItem('state_plans_has_state', JSON.stringify(true));
    localStorage.setItem('state_plans_plans', JSON.stringify(this.plans));
    localStorage.setItem('state_plans_adopted_plans', JSON.stringify(this.adoptedPlans));
    this.serializerUtils.serializeScrollPosition();
  }

  restore(): boolean {
    const hasState = JSON.parse(localStorage.getItem('state_plans_has_state'));

    if (!hasState) {
      return false;
    }

    const statePlans = localStorage.getItem('state_plans_plans');
    const stateAdoptedPlans = localStorage.getItem('state_plans_adopted_plans');

    this.plans = this.plansService.getProperlyTypedPlans(JSON.parse(statePlans));
    this.adoptedPlans = this.plansService.getProperlyTypedPlans(JSON.parse(stateAdoptedPlans));

    return true;
  }

  loadParameterDependentData(username: string, page: any, reloadOn404: boolean = false): void {
    this.isCurrentLoggedInUser = this.authService.isCurrentUserLoggedIn(username);
    this.username = username;

    if (this.restore()) {
      return;
    }

    this.loadPlans(this.username, page, reloadOn404);
  }

  loadPlans(username: string, page: any, reloadOn404: boolean = false) {
    if (!page) {
      page = 1;
    }

    page = +page;

    this.loading = true;
    this.loadingService.load();

    let adoptedPlansObservable: Observable<Plan[]>;

    if (page == 1) {
      adoptedPlansObservable = this.plansService.getAdoptedPlans(this.username);
    }
    else {
      adoptedPlansObservable = of<Plan[]>([]);
    }

    if (this.authService.isLoggedIn()) {
      if (this.authService.isCurrentUserLoggedIn(this.username)) {
        adoptedPlansObservable = adoptedPlansObservable.pipe(tap(plans => this.adoptedPlansByLoggedUser = plans));
      }
      else {
        this.plansService
        .getAdoptedPlans(this.authService.getUsername())
        .subscribe(p => this.adoptedPlansByLoggedUser = p);
      }
    }

    let publicPlansUsernameFilter = null;

    if (!this.authService.isCurrentUserLoggedIn(username)) {
      // if we're accessing the endpoint of a different user's plans then we'll 
      // only see the plans they've created
      publicPlansUsernameFilter = username;
    }

    forkJoin([adoptedPlansObservable,
      this.plansService.getPublicPlans(publicPlansUsernameFilter, page, this.pageSize)])
      .pipe(
        catchError(this.errorService.handleError<Paginated<Plan>>('getPublicPlans', (e: any) =>
        { 
          if (e.status && e.status == 404 && page > 1)  {
            if (reloadOn404) {
              this.router.navigate(['/users', username, 'plans', page-1]);
            }
          }
          else {
            this.alertService.error('Unable to fetch public plans');
          }
        }, new Paginated<Plan>()))
      )
      .subscribe(responses => {
        this.adoptedPlans = responses[0];
        this.currentPage = Number(page);
        if (responses[1]) {
          this.paginatedPlans = responses[1];
          this.plans = responses[1].results;
        }
        else {
          this.paginatedPlans = null;
          this.plans = null;
        }

        this.loading = false;
        this.loadingService.unload();
    });
  }

  showDeleteButton(plan: Plan): boolean {
    return this.authService.isCurrentUserLoggedIn(plan.user.username);
  }

  showAdoptButton(plan: Plan): boolean {
    if (!this.authService.isLoggedIn()) {
      return false;
    }
    /*
    // I'm gonna comment this out because it might make sense to
    // always allow adopted plans even if already adopted because
    // plans might be based on the same plan but then get different
    // iterations
    if (this.adoptedPlansByLoggedUser && 
      this.adoptedPlansByLoggedUser.filter(a => a.parent_plan == plan.id).length > 0) {
      return false;
    }
    */

    return true;
  }

  deletePlan(plan): void {
    this.plansService.deletePlan(plan).subscribe(_ => this.loadParameterDependentData(this.username, this.currentPage, true));
  }

  planAdopted() {
    if ((!this.currentPage || this.currentPage == 1) &&
      this.username == this.authService.getUsername()) {
      window.scroll(0,0);
      this.loadParameterDependentData(this.username, 1);
    }
    else {
      this.router.navigateByUrl(`/users/${this.authService.getUsername()}/plans`);
    }
  }
}
