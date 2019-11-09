import { Component, OnInit, Input } from '@angular/core';
import { PlanSession } from '../plan-session';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { PlanSessionGroup } from '../plan-session-group';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-plan-session',
  templateUrl: './plan-session.component.html',
  styleUrls: ['./plan-session.component.css']
})
export class PlanSessionComponent implements OnInit {
  @Input() planSession: PlanSession;
  @Input() exercises: Exercise[];
  @Input() triedToSave: boolean;

  faTimesCircle = faTimesCircle;

  constructor() { }

  ngOnInit() {
  }

  newGroup() {
    let newGroup = new PlanSessionGroup();
    newGroup.name= "New Group";

    this.planSession.groups.push(newGroup);
  }

  removeGroup(group) {
    const index = this.planSession.groups.indexOf(group, 0);
    if (index > -1) {
      this.planSession.groups.splice(index, 1);
    }
  }
}
