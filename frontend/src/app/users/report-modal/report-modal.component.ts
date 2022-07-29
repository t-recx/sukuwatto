import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { AlertService } from 'src/app/alert/alert.service';
import { Report } from '../report';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.css']
})
export class ReportModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() tier: string;
  @Output() closed = new EventEmitter();

  @Input() target_plan: number;
  @Input() target_post: number;
  @Input() target_exercise: number;
  @Input() target_workout: number;
  @Input() target_comment: number;
  @Input() target_user: number;

  triedToReport: boolean = false;

  description: string;

  faCheck = faCheck;
  faTimes = faTimes;

  constructor(
    private reportService: ReportService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
  }

  valid(): boolean {
    if (!this.description || this.description.trim().length == 0) {
      return false;
    }

    return true;
  }

  report(): void {
    this.triedToReport = true;

    if (this.valid()) {
      this.saveReport();
    }
  }

  saveReport() {
    this.reportService.createReport(new Report({
      description: this.description,
      target_plan: this.target_plan,
      target_exercise: this.target_exercise,
      target_workout: this.target_workout,
      target_post: this.target_post,
      target_comment: this.target_comment,
      target_user: this.target_user,
    })).subscribe(x => {
      if (x != null) {
        this.alertService.success('Resource reported successfully');
        this.close();
      }
    });
  }

  close(): void {
    this.triedToReport = false;
    this.description = '';
    this.closed.emit();
  }
}
