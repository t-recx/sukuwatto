import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {
  refreshing = new Subject();
  refreshed = new Subject();

  constructor() { }

  refresh() {
    this.refreshing.next();
  }

  finish() {
    this.refreshed.next();
  }
}
