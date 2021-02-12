import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { LeaderboardPosition, LeaderboardTimespan } from '../leaderboard-position';
import { LeaderboardService } from '../leaderboard.service';
import { WorkoutsService } from '../workouts.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() username: string;

  selectedLeaderboardTimespan: LeaderboardTimespan = LeaderboardTimespan.Week;
  leaderboardTimespan = LeaderboardTimespan;

  positions: LeaderboardPosition[];
  workoutCreatedSubscription: Subscription;
  workoutUpdatedSubscription: Subscription;
  workoutDeletedSubscription: Subscription;

  constructor(
    private leaderboardService: LeaderboardService,
    private workoutService: WorkoutsService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.selectedLeaderboardTimespan = this.authService.getLeaderboardTimespan();

    this.workoutCreatedSubscription = this.workoutService.workoutCreated.subscribe(() => {
      this.updateLeaderboard();
    });

    this.workoutUpdatedSubscription = this.workoutService.workoutUpdated.subscribe(() => {
      this.updateLeaderboard();
    });

    this.workoutDeletedSubscription = this.workoutService.workoutDeleted.subscribe(() => {
      this.updateLeaderboard();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateLeaderboard();
  }

  ngOnDestroy(): void {
    this.workoutCreatedSubscription.unsubscribe();
    this.workoutUpdatedSubscription.unsubscribe();
    this.workoutDeletedSubscription.unsubscribe();
  }

  updateLeaderboard() {
    this.leaderboardService.getDashboard(this.selectedLeaderboardTimespan).subscribe(positions => {
      this.positions = positions;
    });
  }

  changeTimespan(timespan: LeaderboardTimespan) {
    if (timespan != this.selectedLeaderboardTimespan) {
      this.selectedLeaderboardTimespan = timespan;
      this.updateLeaderboard();

      this.authService.setLeaderboardTimespan(this.selectedLeaderboardTimespan);
    }
  }
}
