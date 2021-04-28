import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { faAddressCard, faTasks, faDumbbell, faCalendarAlt, faComments, faHome, faWeight, faUsers, faCode, faBoxOpen, faHeart, faTrophy, faFlag } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {
  @Input() unread_messages_count: number;
  iconHome = faHome;
  iconProfile = faAddressCard;
  iconMessages = faComments;
  iconWorkouts = faTasks;
  iconExercises = faDumbbell;
  iconPlans = faCalendarAlt;
  iconMeasurements = faWeight;
  iconUsers = faUsers;
  iconDevelopment = faCode;
  iconReleases = faBoxOpen;
  iconSupport = faHeart;
  iconLeaderboards = faTrophy;
  iconReports = faFlag;

  isRouterLinkPlans = false;
  isRouterLinkHome = false;
  isRouterLinkReports = false;
  routerSubscription: Subscription;
  showSupportSection = false;

  userSubscription: Subscription;
  isStaff = false;

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {
    this.routerSubscription = router.events.subscribe(e => {
      this.checkIfCurrentRouterUrlIsPlans(router);
      this.checkIfCurrentRouterUrlIsHome(router);
      this.checkIfCurrentRouterUrlIsReports(router);
    });

    this.userSubscription = this.authService.userLoggedStatusChanged.subscribe(() => {
      this.checkIfUserIsStaff();
    });
    
    this.checkIfCurrentRouterUrlIsReports(router);
    this.checkIfCurrentRouterUrlIsPlans(router);
    this.checkIfCurrentRouterUrlIsHome(router);
    this.checkIfUserIsStaff();
   }

  private checkIfUserIsStaff() {
    this.isStaff = this.authService.isLoggedIn() && this.authService.userIsStaff();
  }

  private checkIfCurrentRouterUrlIsPlans(router: Router) {
    if (!this.authService.isLoggedIn()) {
      this.isRouterLinkPlans = false;
    }
    else {
      const prefix = '/users/' + this.authService.getUsername();
      this.isRouterLinkPlans = router.url.startsWith(prefix + '/plans') ||
        router.url.startsWith(prefix + '/adopted-plans') ||
        router.url.startsWith(prefix + '/owned-plans');
    }
  }

  private checkIfCurrentRouterUrlIsReports(router: Router) {
    if (!this.authService.isLoggedIn()) {
      this.isRouterLinkReports = false;
    }
    else {
      const prefix = '/users/' + this.authService.getUsername();
      this.isRouterLinkReports = router.url.startsWith(prefix + '/reports') ||
        router.url.startsWith(prefix + '/closed-reports') ||
        router.url.startsWith(prefix + '/resolved-reports');
    }
  }

  private checkIfCurrentRouterUrlIsHome(router: Router) {
    if (!this.authService.isLoggedIn()) {
      this.isRouterLinkHome = false;
    }
    else {
      const prefix = '/users/' + this.authService.getUsername();
      this.isRouterLinkHome = router.url.startsWith(prefix + '/home') ||
        router.url == prefix;
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  ngOnInit() {
    this.showSupportSection = environment.showSupportSection;
  }

}
