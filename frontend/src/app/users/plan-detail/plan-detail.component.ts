import { Component, OnInit } from '@angular/core';
import { PlansService } from '../plans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Plan } from '../plan';
import { faCalendarPlus, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { PlanSession } from '../plan-session';
import { Exercise } from '../exercise';
import { ExercisesService } from '../exercises.service';
import { PlanSessionGroupExercise } from '../plan-session-group-exercise';
import { PlanSessionGroup } from '../plan-session-group';
import { PlanSessionGroupActivity } from '../plan-session-group-activity';
import { Unit } from '../unit';
import { UnitsService } from '../units.service';

@Component({
  selector: 'app-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.css']
})
export class PlanDetailComponent implements OnInit {
  faCalendarPlus = faCalendarPlus;
  faTimesCircle = faTimesCircle;

  plan: Plan;
  selectedSession: PlanSession;
  exercises: Exercise[];
  units: Unit[];
  triedToSave: boolean;

  constructor(
    private route: ActivatedRoute,
    private service: PlansService,
    private exercisesService: ExercisesService,
    private unitsService: UnitsService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.triedToSave = false;
    this.loadExercises();
    this.loadUnits();
    this.loadOrInitializePlan();
  }

  private loadOrInitializePlan() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.getPlan(id).subscribe(plan => {
        this.plan = plan;
        if (this.plan.sessions && this.plan.sessions.length > 0) {
          this.selectedSession = this.plan.sessions[0];
        }
      });
    }
    else {
      this.plan = new Plan();
    }
  }

  private loadExercises() {
    this.exercisesService.getExercises()
    .subscribe(exercises => 
      this.exercises = exercises.sort((a, b) => a.name.localeCompare(b.name)));
  }

  private loadUnits() {
    this.unitsService.getUnits()
    .subscribe(units => 
      this.units = units);
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
      return;
    }

    this.service.savePlan(this.plan).subscribe(plan => {
      this.triedToSave = false;

      if (!this.plan.id || this.plan.id <= 0) {
        this.router.navigate(['../plans'], {
          relativeTo: this.route,
        });
      }
      else {
        this.router.navigate(['../../plans'], {
          relativeTo: this.route,
        });
      }
    });
  }
}
