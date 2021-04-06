import { Component, OnInit } from '@angular/core';
import { faEnvelope, faLaughBeam, faCalendarAlt, faRunning, faShareAlt, faHeart, faCircleNotch, faSmile, faLaugh, faCalendar, faCalendarDay, faArrowCircleRight, faSignInAlt, faUserPlus, faSnowboarding } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../user.service';
import { catchError } from 'rxjs/operators';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { environment } from 'src/environments/environment';
import { faAndroid } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  emailSubscription: string;

  appDownloadIcon = faAndroid;
  submitIcon = faHeart;
  planIcon = faCalendarAlt;
  trackIcon = faRunning;
  shareIcon = faShareAlt;
  happyIcon = faLaugh;
  arrowRight = faArrowCircleRight;
  
  faSnowboarding = faSnowboarding;

  loadingIcon = faCircleNotch;
  invalidEmail = false;

  triedToSubmit = false;

  submitting = false;
  submitted = false;

  constructor(
    private usersService: UserService,
    private errorService: ErrorService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
  }

  submitEmailSubscription() {
    this.triedToSubmit = true;
    if(!this.emailSubscription || this.emailSubscription.trim().length == 0) {
      this.invalidEmail = true;
      return;
    }

    this.invalidEmail = false;
    this.submitting = true;

    this.usersService
    .expressInterest(this.emailSubscription)
    .pipe(
      catchError(this.errorService.handleError<any>('expressInterest', (e: any) =>
      {
        if (e.error && e.error.email) {
          if (e.error.email[0].includes('valid')) {
            this.invalidEmail = true;
          }
        }
        else {
          this.alertService.error('Unable to submit email, try again later');
        }
      }, null))
    )
    .subscribe(x => {
      this.submitting = false;
      this.triedToSubmit = false;

      if (!this.invalidEmail) {
        this.submitted = true;
      }
    });
  }
}
