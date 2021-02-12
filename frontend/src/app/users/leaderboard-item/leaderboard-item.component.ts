import { Component, Input, OnInit } from '@angular/core';
import { LeaderboardPosition } from '../leaderboard-position';

@Component({
  selector: 'app-leaderboard-item',
  templateUrl: './leaderboard-item.component.html',
  styleUrls: ['./leaderboard-item.component.css']
})
export class LeaderboardItemComponent implements OnInit {
  @Input() position: LeaderboardPosition;

  constructor() { }

  ngOnInit(): void {
  }

}
