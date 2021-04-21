import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LanguageService } from 'src/app/language.service';
import { UnitsService } from '../units.service';
import { UserBioData } from '../user-bio-data';
import { UserProgressService } from '../user-progress.service';

@Component({
  selector: 'app-measurement-card',
  templateUrl: './measurement-card.component.html',
  styleUrls: ['./measurement-card.component.css']
})
export class MeasurementCardComponent implements OnInit, OnDestroy {
  @Input() userBioData: UserBioData;
  @Input() detailView: boolean;
  @Input() commentsSectionOpen: boolean = false;

  chartData: any;

  routerLink: any;
  shareTitle: string;
  shareLink: string;

  languageChangedSubscription: Subscription;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private languageService: LanguageService,
    private userProgressService: UserProgressService,
    private unitsService: UnitsService,
  ) { 
    this.languageChangedSubscription = languageService.languageChanged.subscribe(x => {
      this.updateShareTitle(this.userBioData);
    });
  }

  ngOnDestroy(): void {
    this.languageChangedSubscription.unsubscribe();
  }

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
      this.updateShareTitle(measurement);
      this.shareLink = window.location.origin.replace('android.', 'www.') + this.router.createUrlTree(this.routerLink);
    }
  }

  updateShareTitle(measurement: UserBioData) {
    if (measurement) {
      this.translate.get('sukuwatto: {{username}}\'s measurement ({{creation_date}})', {creation_date:measurement.creation.toLocaleDateString(), username: measurement.user.username})
      .subscribe(res => {
        this.shareTitle = res;
      }) ;
    }
  }
}
