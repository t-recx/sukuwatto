import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faBan, faCheck, faEye, faFolderOpen, faStickyNote, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/alert/alert.service';
import { Report, ReportState, ReportStateLabel } from '../report';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-report-card',
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.css']
})
export class ReportCardComponent implements OnInit, OnDestroy {
  @Input() report: Report;
  @Output() stateChanged = new EventEmitter();

  paramChangedSubscription: Subscription;

  stateLabel = ReportStateLabel;

  username: string;
  notes: string;

  faEye = faEye;
  faTimes = faTimes;
  faBan = faBan;
  faNote = faStickyNote;
  faCheck = faCheck;
  faFolderOpen = faFolderOpen;

  notesModalVisible: boolean = false;
  closeModalVisible: boolean = false;

  constructor(
    public route: ActivatedRoute,
    private reportService: ReportService,
  ) {
    this.paramChangedSubscription = this.route.paramMap.subscribe(params => {
      this.username = params.get('username');
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  showCloseModal(): void {
    this.notes = this.report.notes;
    this.notesModalVisible = this.closeModalVisible = true;
  }

  close() {
    this.notesModalVisible = false;
    this.closeModalVisible = false;
    this.report.notes = this.notes;

    this.stateChanged.emit(this.report);
  }

  showResolvedModal() {
    this.notesModalVisible = true;
  }

  doAction() {
    this.report.state = ReportState.Resolved;

    if (this.closeModalVisible) {
      this.report.state = ReportState.Closed;
    }

    this.reportService.updateReport(this.report).subscribe(() => {
      this.close();
    });
  }

  reOpen() {
    this.report.state = ReportState.Open;

    this.reportService.updateReport(this.report).subscribe(() => {
      this.stateChanged.emit(this.report);
    });
  }
}
