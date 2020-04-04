import { Component, OnInit, Input } from '@angular/core';
import { PlanSession } from '../plan-session';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { PlanSessionGroup } from '../plan-session-group';

@Component({
  selector: 'app-plan-session',
  templateUrl: './plan-session.component.html',
  styleUrls: ['./plan-session.component.css']
})
export class PlanSessionComponent implements OnInit {
  @Input() planSession: PlanSession;
  @Input() triedToSave: boolean;

  faTimesCircle = faTimesCircle;

  selectedTab: string = 'session';

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  constructor() { }

  ngOnInit() {
  }

  newGroup() {
    let newGroup = new PlanSessionGroup();
    newGroup.name= "New Group";

    this.setOrder(newGroup, this.planSession.groups);

    this.planSession.groups.push(newGroup);
  }

  setOrder(item: any, items: any) {
    let orders = items.map(x => x.order).sort((a, b) => b - a);

    if (items.length > 0) {
      item.order = orders[0] + 1;
    }
    else {
      item.order = 1;
    }
  }

  removeGroup(group) {
    const index = this.planSession.groups.indexOf(group, 0);
    if (index > -1) {
      this.planSession.groups.splice(index, 1);
      
      this.planSession.groups.filter(x => x.order > group.order).forEach(x => x.order--);
    }
  }
}
