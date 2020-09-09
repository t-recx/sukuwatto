import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {
  refreshing = new Subject();
  refreshed = new Subject();
  pullDownIconTriggered = new Subject();

  constructor() { }

  refresh() {
    this.refreshing.next();
  }

  finish() {
    this.refreshed.next();
  }

  triggerPullDownIcon() {
    this.pullDownIconTriggered.next();
  }
}
