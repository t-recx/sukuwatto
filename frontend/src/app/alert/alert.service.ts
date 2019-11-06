import { Injectable } from '@angular/core';
import { Alert, AlertType } from './alert';
import { Subject, Observable } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  alerts: Alert[] = [];

  constructor(private router: Router) { 
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.clear();
      }
    });
  }

  success(message: string) {
    this.alert(new Alert({ message, type: AlertType.Success }));
  }

  error(message: string) {
    this.alert(new Alert({ message, type: AlertType.Error }));
  }

  info(message: string) {
    this.alert(new Alert({ message, type: AlertType.Info }));
  }

  warn(message: string) {
    this.alert(new Alert({ message, type: AlertType.Warning }));
  }

  alert(alert: Alert) {
    this.alerts.push(alert);
  }

  remove(alert: Alert) {
    const index = this.alerts.indexOf(alert, 0);

    if (index > -1) {
      this.alerts.splice(index, 1);
    }
  }
  clear(): void {
    this.alerts = [];
  }
}
