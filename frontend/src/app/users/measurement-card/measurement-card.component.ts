import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UnitsService } from '../units.service';
import { UserBioData } from '../user-bio-data';
import { UserProgressService } from '../user-progress.service';

@Component({
  selector: 'app-measurement-card',
  templateUrl: './measurement-card.component.html',
  styleUrls: ['./measurement-card.component.css']
})
export class MeasurementCardComponent implements OnInit {
  @Input() userBioData: UserBioData;
  @Input() detailView: boolean;
  @Input() commentsSectionOpen: boolean = false;

  chartData: any;

  routerLink: any;
  shareTitle: string;
  shareLink: string;

  dateString: string;

  constructor(
    private router: Router,
    private userProgressService: UserProgressService,
    private unitsService: UnitsService,
  ) { }

  getUnitCode(id: number): string {
    return this.unitsService.getUnitCode(id);
  }

  ngOnInit(): void {
    this.setupMeasurement(this.userBioData);
  }

  setupMeasurement(measurement: UserBioData) {
    if (measurement) {
      this.unitsService.convertUserBioData(this.userBioData);
      this.userProgressService.userBioDataToProgressChart(this.userBioData).subscribe(x => {
        if (x && x.series && x.series.length > 0 && x.series[0].dataPoints && x.series[0].dataPoints.length > 1) {
          this.chartData = x;
        }
      });
      this.routerLink = ['/users', measurement.user.username, 'measurement', measurement.id];
      this.shareTitle = 'sukuwatto: ' + measurement.user.username + '\'s measurement (' + measurement.creation.toLocaleDateString() + ')';
      this.shareLink = window.location.origin.replace('android.', 'www.') + this.router.createUrlTree(this.routerLink);
      this.dateString = this.userBioData.date.toLocaleDateString();
    }
  }

}
