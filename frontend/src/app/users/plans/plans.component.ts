import { Component, OnInit, OnDestroy, AfterContentInit, AfterViewInit } from '@angular/core';
import { Plan } from '../plan';
import { PlansService } from '../plans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth.service';
import { LoadingService } from '../loading.service';
import { CordovaService } from 'src/app/cordova.service';
import { Subscription, forkJoin } from 'rxjs';
import { SerializerUtilsService } from 'src/app/serializer-utils.service';
import { UnitsService } from '../units.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent implements OnInit, OnDestroy, AfterViewInit {
  plans: Plan[] = [];
  adoptedPlans: Plan[] = [];
  username: string;
  faCalendarAlt = faCalendarAlt;

  loading: boolean = false;
  pausedSubscription: Subscription;

  constructor(
    private plansService: PlansService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private loadingService: LoadingService,
    private cordovaService: CordovaService,
    private unitsService: UnitsService,
    private serializerUtils: SerializerUtilsService,
  ) { }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.username = this.route.snapshot.paramMap.get('username');
    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.serialize());

    this.loadPlans();
  }

  ngAfterViewInit(): void {
    this.serializerUtils.restoreScrollPosition();
  }

  ngOnDestroy(): void {
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

  loadPlans(): void {
    if (this.restore()) {
      return;
    }

    this.loading = true;
    this.loadingService.load();

    forkJoin([this.plansService.getAdoptedPlans(this.username), this.plansService.getPublicPlans()]).subscribe(responses => {
        this.adoptedPlans = responses[0];
        this.plans = responses[1];

        this.loading = false;
        this.loadingService.unload();
    });
  }

  loadAdoptedPlans(): void {
    this.loading = true;
    this.loadingService.load();

    this.plansService.getAdoptedPlans(this.username).subscribe(adoptedPlans => {
      this.adoptedPlans = adoptedPlans;
      this.loading = false;
      this.loadingService.unload();
    });
  }

  showDeleteButton(plan): boolean {
    return this.authService.isCurrentUserLoggedIn(plan.username);
  }

  deletePlan(plan): void {
    this.plansService.deletePlan(plan).subscribe(_ => this.loadPlans());
  }
}
