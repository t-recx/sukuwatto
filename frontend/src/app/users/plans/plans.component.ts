import { Component, OnInit } from '@angular/core';
import { Plan } from '../plan';
import { PlansService } from '../plans.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent implements OnInit {
  plans: Plan[];

  constructor(
    private plansService: PlansService
  ) { }

  ngOnInit() {
    this.getPlans();
  }

  getPlans(): void {
    this.plansService.getPlans().subscribe(plans => this.plans = plans);
  }

  deletePlan(plan): void {
    this.plansService.deletePlan(plan).subscribe(_ => this.getPlans());
  }
}
