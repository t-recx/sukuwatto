import { Component, OnInit } from '@angular/core';
import { Plan } from '../plan';
import { PlansService } from '../plans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

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

  adoptPlan(plan): void {
    this.plansService.adoptPlan(plan).subscribe(savedPlan =>
      {
        if (savedPlan && savedPlan.id && savedPlan.id > 0)
        {
          this.loadAdoptedPlans();
        }
      });
  }

  deletePlan(plan): void {
    this.plansService.deletePlan(plan).subscribe(_ => this.loadPlans());
  }
}
