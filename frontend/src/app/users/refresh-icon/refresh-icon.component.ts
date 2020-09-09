import { Component, OnInit, OnDestroy } from '@angular/core';
import { RefreshService } from '../refresh.service';
import { Subscription } from 'rxjs';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-refresh-icon',
  templateUrl: './refresh-icon.component.html',
  styleUrls: ['./refresh-icon.component.css']
})
export class RefreshIconComponent implements OnInit, OnDestroy {

  faSyncAlt = faSyncAlt;

  iconSubscription: Subscription;
  refreshedSubscription: Subscription;

  refreshing: boolean = false;
  refreshTop: number = -36;
  scale: number = 1;
  opacity = 0;
  transitionMs = 50;
  
  constructor(
    private refreshService: RefreshService
  ) { 
    this.iconSubscription = refreshService.pullDownIconTriggered.subscribe(() => {
      this.refreshing = true;
      this.transitionMs = 50;
      this.opacity = 1;
      this.scale = 1;
      this.refreshTop = 80;
    });

    this.refreshedSubscription = refreshService.refreshed.subscribe(() => {
      this.refreshing = false;
      this.scale = 0;
      this.opacity = 0.5;
      this.transitionMs = 200;
      setTimeout(() => this.refreshTop = -36, this.transitionMs);
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.iconSubscription.unsubscribe();
    this.refreshedSubscription.unsubscribe();
  }
}
