import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Tier, TierLabel } from 'src/app/user';

@Component({
  selector: 'app-support-tip',
  templateUrl: './support-tip.component.html',
  styleUrls: ['./support-tip.component.css']
})
export class SupportTipComponent implements OnInit, OnDestroy {
  @Input() tier: string;

  TierLabel = TierLabel;

  username: string;

  paramChangedSubscription: Subscription;

  constructor(
    public route: ActivatedRoute
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

}
