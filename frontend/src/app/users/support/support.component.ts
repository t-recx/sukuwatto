import { Component, OnInit } from '@angular/core';
import { faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit {
  arrowRight = faArrowCircleRight;
  currentTier: string = 'n';

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentTier = this.authService.getUserTier();
  }

  cancelSubscription(): void {
    // todo
    this.authService.setUserTier('n');
    this.currentTier = 'n';
  }

  subscribe(tier: string): void {
    // todo
    this.authService.setUserTier(tier);
    this.currentTier = tier;
  }

}
