import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/alert/alert.service';
import { AuthService } from 'src/app/auth.service';
import { CordovaService } from 'src/app/cordova.service';
import { SerializerUtilsService } from 'src/app/serializer-utils.service';
import { LoadingService } from '../loading.service';
import { Report } from '../report';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.css']
})
export class ReportDetailComponent implements OnInit {
  report: Report;

  notFound = false;
  loading = false;
  canView = false;

  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private authService: AuthService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params =>
      this.loadOrInitializeReport(params.get('id')));
  }

  private loadOrInitializeReport(id: string): void {
    this.canView = this.authService.isLoggedIn() && this.authService.userIsStaff();

    if (!this.canView) {
      return;
    }

    this.notFound = false;

    this.loading = true;
    this.loadingService.load();
    this.service.getReport(id).subscribe(report => {
      this.report = report;
      if (!this.report) {
        this.notFound = true;
      }
      this.loading = false;
      this.loadingService.unload();
    });
  }
}
