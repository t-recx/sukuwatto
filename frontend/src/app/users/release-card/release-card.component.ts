import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Feature } from '../feature';
import { Release, ReleaseStateLabel } from '../release';
import { ReleasesService } from '../releases.service';
import { TimeService } from '../time.service';

@Component({
  selector: 'app-release-card',
  templateUrl: './release-card.component.html',
  styleUrls: ['./release-card.component.css']
})
export class ReleaseCardComponent implements OnInit, OnDestroy {
  @Input() id: number;
  @Input() release: Release = null;
  @Input() detailView: boolean = true;
  @Input() commentsSectionOpen: boolean = false;

  stateLabel = ReleaseStateLabel;

  routerLink: any;
  shareTitle: string;
  shareLink: string;

  paramChangedSubscription: Subscription;
  username: string;

  constructor(
    private releasesService: ReleasesService,
    route: ActivatedRoute,
    private router: Router,
    private timeService: TimeService,
  ) {
    this.paramChangedSubscription = route.paramMap.subscribe(val =>
      {
        this.username = val.get('username');
      });
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  ngOnInit(): void {
    if (!this.release && this.id) {
      this.releasesService.getRelease(this.id).subscribe(e => {
        this.release = e;

        this.setupRelease(e);
      });
    }
    else {
      this.setupRelease(this.release);
    }
  }

  getTime(date): string {
    return this.timeService.getTimeOrDateIfNotToday(date);
  }

  private setupRelease(e: Release) {
    if (!e) {
      return;
    }

    this.routerLink = ['/users', this.username, 'release', this.release.id];
    this.shareTitle = 'sukuwatto: ' + e.version + ' release';
    this.shareLink = window.location.origin.replace('android.', 'www.') + this.router.createUrlTree(this.routerLink);
  }
}
