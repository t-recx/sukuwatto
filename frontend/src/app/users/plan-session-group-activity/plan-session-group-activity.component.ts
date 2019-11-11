import { Component, OnInit, Input } from '@angular/core';
import {  PlanSessionGroupActivity } from '../plan-session-group-activity';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-plan-session-group-activity',
  templateUrl: './plan-session-group-activity.component.html',
  styleUrls: ['./plan-session-group-activity.component.css']
})
export class PlanSessionGroupExerciseComponent implements OnInit {
  @Input() planSessionGroupExercise: PlanSessionGroupActivity;
  @Input() exercises: Exercise[];
  @Input() triedToSave: boolean;

  constructor() { }

  ngOnInit() {
  }

}
