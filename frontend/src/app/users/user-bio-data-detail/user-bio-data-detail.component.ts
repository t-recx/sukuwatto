import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { UserBioData } from '../user-bio-data';
import { UserBioDataService } from '../user-bio-data.service';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-bio-data-detail',
  templateUrl: './user-bio-data-detail.component.html',
  styleUrls: ['./user-bio-data-detail.component.css']
})
export class UserBioDataDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() username: string;
  @Input() start: Date;
  @Input() visible: boolean;
  @Output() closed = new EventEmitter();
  @Output() okayed = new EventEmitter<UserBioData>();

  faCheck = faCheck;

  triedToHide: boolean;
  userBioData: UserBioData;

  constructor(
    private service: UserBioDataService,
    ) { }

  ngOnInit() {

    this.userBioData = new UserBioData();
    this.userBioData.date = this.start;
    this.triedToHide = false;

    this.loadUserBioData();
  }

  ngOnDestroy(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    let startChanged: boolean = false;

    startChanged = "start" in changes;

    if (startChanged && this.userBioData) {
      this.userBioData.date = this.start;

      this.loadUserBioData();
    }
  }

  loadUserBioData(): void {
    if (!this.start) {
      return;
    }

    this.service.getLastUserBioData(this.username, new Date(this.start))
      .subscribe(data => {
        if (data) {
          this.userBioData = data;

          delete this.userBioData.id;

          this.userBioData.date = this.start;
        }
      });
  }


  hide(): boolean {
    this.triedToHide = true;

    if (!this.service.valid(this.userBioData)) {
      return false;
    }

    this.visible = false;
    this.triedToHide = false;
    this.closed.emit();

    return true;
  }

  okay(): void {
    if (this.hide()) {
      this.okayed.emit(this.userBioData);
    }
  }
}
