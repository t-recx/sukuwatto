import { Component, OnInit } from '@angular/core';
import { Plan } from '../plan';
import { PlansService } from '../plans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth.service';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent implements OnInit {
  plans: Plan[];
  adoptedPlans: Plan[];
  username: string;
  faCalendarAlt = faCalendarAlt;

  loading: boolean = false;

  constructor(
    private plansService: PlansService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private loadingService: LoadingService,
  ) { }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.username = this.route.snapshot.paramMap.get('username');

    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;
    this.loadingService.load();

    this.plansService.getAdoptedPlans(this.username).subscribe(adoptedPlans => {
      this.adoptedPlans = adoptedPlans;

      this.plansService.getPublicPlans().subscribe(plans => {
        this.plans = plans;

        this.loading = false;
        this.loadingService.unload();
      });
    });
  }

  loadAdoptedPlans() :void {
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
