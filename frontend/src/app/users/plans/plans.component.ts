import { Component, OnInit } from '@angular/core';
import { Plan } from '../plan';
import { PlansService } from '../plans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth.service';

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

  constructor(
    private plansService: PlansService,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.username = this.route.snapshot.paramMap.get('username');

    this.loadPlans();
  }

  loadPlans(): void {
    this.loadPublicPlans();
    this.loadAdoptedPlans();
  }

  loadPublicPlans(): void {
    this.plansService.getPublicPlans().subscribe(plans => this.plans = plans);
  }

  loadAdoptedPlans(): void {

    this.plansService.getAdoptedPlans(this.username).subscribe(plans => this.adoptedPlans = plans);
  }

  showDeleteButton(plan): boolean {
    return this.authService.isCurrentUserLoggedIn(plan.username);
  }

  deletePlan(plan): void {
    this.plansService.deletePlan(plan).subscribe(_ => this.loadPlans());
  }
}
