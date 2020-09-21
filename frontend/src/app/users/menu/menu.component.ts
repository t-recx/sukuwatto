import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { faAddressCard, faTasks, faDumbbell, faCalendarAlt, faComments, faHome, faWeight } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {
  iconHome = faHome;
  iconProfile = faAddressCard;
  iconMessages = faComments;
  iconWorkouts = faTasks;
  iconExercises = faDumbbell;
  iconPlans = faCalendarAlt;
  iconMeasurements = faWeight;

  isRouterLinkPlans = false;
  routerSubscription: Subscription;

  constructor(
    public authService: AuthService, 
    private router: Router,
  ) {
    this.routerSubscription = router.events.subscribe(e => {
      this.checkIfCurrentRouterUrlIsPlans(router);
    });
    
    this.checkIfCurrentRouterUrlIsPlans(router);
   }

  private checkIfCurrentRouterUrlIsPlans(router: Router) {
    if (!this.authService.isLoggedIn()) {
      this.isRouterLinkPlans = false;
    }
    else {
      const prefix = '/users/' + this.authService.getUsername();
      this.isRouterLinkPlans = router.url == prefix + '/plans' ||
        router.url == prefix + '/adopted-plans' ||
        router.url == prefix + '/owned-plans';
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  ngOnInit() {
  }

}
