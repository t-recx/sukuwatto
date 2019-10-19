import { Component, OnInit } from '@angular/core';
import { AlertService } from '../alert.service';
import { Alert, AlertType } from '../alert';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  constructor(public alertService: AlertService) { }

  ngOnInit() {
  }

  cssClass(alert: Alert) {
    if (!alert) {
      return;
    }

    switch (alert.type) {
      case AlertType.Success:
        return 'siimple-alert--success';
      case AlertType.Error:
        return 'siimple-alert--error';
      case AlertType.Info:
        return 'siimple-alert--primary';
      case AlertType.Warning:
        return 'siimple-alert--warning';
    }
  }
}
