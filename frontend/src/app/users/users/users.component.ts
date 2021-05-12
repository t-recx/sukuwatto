import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ApplicationRef } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd } from '@angular/router';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { concat, interval, Subject, Subscription } from 'rxjs';
import { HostListener } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { RefreshService } from '../refresh.service';
import { environment } from 'src/environments/environment';
import { debounce, delay, filter, first, repeatWhen, switchMap } from 'rxjs/operators';
import { LastMessagesService } from '../last-messages.service';
import { CordovaService } from 'src/app/cordova.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { FeedService } from '../feed.service';
import { Message } from '../message';
import { UserVisibleChartData } from '../user-available-chart-data';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy, AfterViewInit {
  feedSocket: WebSocketSubject<any>;

  menuDropDownVisible: boolean = false;

  faBars = faBars;
  faTimes = faTimes;

  touchBodyStartTime: number;
  touchBodyStartPageY = 0;
  touchBodyMovePageY = 0;

  username: string;
  loading = false;
  loadingSubscription: Subscription;
  menuWidthOpen = 85;
  menuWidth = this.menuWidthOpen;
  overlayPointerEvents = 'none';

  menuLeft = -this.menuWidthOpen - 5;
  menuTranslateX = 'translate(' + this.menuLeft + 'vw)';

  updateConversationSubscription: Subscription;
  pollTimeUnreadConversationsMilliseconds: number = 30000;
  updateLastMessageReadSubscription: Subscription;
  pausedSubscription: any;

  screenWidth = 0;
  screenHeight = 0;
  transitionMenuMsDefault = 400;
  transitionMenuMs = this.transitionMenuMsDefault;
  transitionOverlayMsDefault = 400;
  transitionOverlayMs = this.transitionOverlayMsDefault;
  overlayOpacityDefault = 40;
  overlayOpacity = 0;
  touchStartTime = 0;
  thresholdCloseAnywayMs = 200;
  touchStartClientX = 0;
  touchStartClientY = 0;

  routerNavigationSubscription: Subscription;
  updateAvailableSubscription: Subscription;
  checkUpdatesSubscription: Subscription;
  updateSnackbarVisible = false;
  checkForUpdatesProgramatically = false;

  dropDownHidden = true;
  isScrolling = false;
  isMovingDropdown = false;

  unread_messages_count: number = 0;
  newMessageSubscription: Subscription;

  isRouterLinkWorkouts: boolean = false;
  isRouterLinkBody: boolean = false;
  isRouterLinkSupport: boolean = false;

  chartDataVisibility: UserVisibleChartData = null;
  chartDataBodyVisibility = new UserVisibleChartData({
    show_bio_data_records: true,
    show_weight_records: true });
  chartDataWorkoutsVisibility = new UserVisibleChartData({
    show_compound_exercises: true,
    show_distance_exercises: true,
    show_distance_exercises_last_month: true,
    show_isolation_exercises: true });

  rightSideBarVisible = false;

  setRightSideBarVisible() {
    this.rightSideBarVisible = window.innerWidth > 1280 && !this.isRouterLinkSupport;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    if (!this.menuDropDownVisible) {
      this.dropDownHidden = true;
      setTimeout(() => this.dropDownHidden = false, this.transitionMenuMsDefault);
    }

    this.setRightSideBarVisible();

    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;

    if (this.screenWidth > this.screenHeight || this.screenWidth > 600) {
      this.menuWidthOpen = 45;
    }
    else {
      this.menuWidthOpen = 85;
    }

    this.menuWidth = this.menuWidthOpen;
    this.menuLeft = !this.menuDropDownVisible ? -this.menuWidthOpen - 5 : 0;

    this.updateMenuTranslateX();
  }

  updateMenuTranslateX() {
    this.menuTranslateX = 'translate(' + this.menuLeft + 'vw)';
  }

  constructor(
    private feedService: FeedService,
    private lastMessagesService: LastMessagesService,
    private cordovaService: CordovaService,
    public authService: AuthService,
    public route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private elementRef: ElementRef,
    private refreshService: RefreshService,
    private swUpdate: SwUpdate,
    appRef: ApplicationRef
  ) {
    setTimeout(() => this.dropDownHidden = false, this.transitionMenuMsDefault);

    this.routerNavigationSubscription = this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        this.loadingService.reset();
      }

      if (e instanceof NavigationEnd) {
        if (this.menuDropDownVisible) {
          this.setDropDownVisible(false);
        }
      }

      this.checkRouterLinks(router);
    });

    this.checkRouterLinks(router);
    this.checkForUpdatesProgramatically = swUpdate.isEnabled && environment.application;

    if (this.checkForUpdatesProgramatically) {
      const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
      const everySixHours$ = interval(6 * 60 * 60 * 1000);
      const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

      this.checkUpdatesSubscription = everySixHoursOnceAppIsStable$.subscribe(() => swUpdate.checkForUpdate());

      this.updateAvailableSubscription = swUpdate.available.subscribe(x => {
        this.updateSnackbarVisible = true;
      });
    }

    this.onResize();
  }

  checkRouterLinks(router: Router) {
    if (!this.authService.isLoggedIn()) {
      this.isRouterLinkBody = false;
      this.isRouterLinkWorkouts = false;
      this.isRouterLinkSupport = false;
    }
    else {
      const prefix = '/users/' + this.authService.getUsername();
      this.isRouterLinkBody = router.url.startsWith(prefix + '/measurement');
      this.isRouterLinkWorkouts = router.url.startsWith(prefix + '/workout');
      this.isRouterLinkSupport = router.url.startsWith(prefix + '/support');

      if (this.isRouterLinkBody) {
        this.chartDataVisibility = this.chartDataBodyVisibility;
      }
      else if (this.isRouterLinkWorkouts) {
        this.chartDataVisibility = this.chartDataWorkoutsVisibility;
      }
      else {
        this.chartDataVisibility = null;
      }
    }

    this.setRightSideBarVisible();
  }

  private updateUnreadMessageCount(u: number) {
    if (u != null) {
      this.unread_messages_count = u;
    }
  }

  updateApplication() {
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }

  dismissUpdateNotification() {
    this.updateSnackbarVisible = false;
  }

  ngAfterViewInit(): void {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }

    this.loadingSubscription = this.loadingService.state.subscribe(s => setTimeout(() => this.loading = s));
  }

  serialize() {
    localStorage.setItem('state_users_has_state', JSON.stringify(true));
    localStorage.setItem('state_users_unread_messages_count', JSON.stringify(this.unread_messages_count));
  }

  restore(): boolean {
    const hasState = JSON.parse(localStorage.getItem('state_users_detail_has_state'));

    if (!hasState) {
      return false;
    }

    this.unread_messages_count = JSON.parse(localStorage.getItem('state_users_unread_messages_count'));

    return true;
  }

  ngOnDestroy(): void {
    this.resetBodyOverflow();

    this.loadingSubscription.unsubscribe();
    this.routerNavigationSubscription.unsubscribe();
    this.pausedSubscription.unsubscribe();

    if (this.checkForUpdatesProgramatically) {
      this.updateAvailableSubscription.unsubscribe();
      this.checkUpdatesSubscription.unsubscribe();
    }

    if (this.feedSocket) {
      this.feedSocket.unsubscribe();
    }

    this.newMessageSubscription.unsubscribe();
    this.updateLastMessageReadSubscription.unsubscribe();
  }

  ngOnInit() {
    this.setRightSideBarVisible();

    this.username = this.authService.getUsername();

    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.serialize());
    this.restore();

    if (this.feedSocket) {
      this.feedSocket.unsubscribe();
    }

    this.createFeedSocket();

    this.newMessageSubscription = this.feedService.newMessageSubject
      .pipe(filter(x => x.from_user != +this.authService.getUserId()), debounce(() => interval(1500)), 
      switchMap(x =>
        this.lastMessagesService.getUnreadConversationsNumber()
      ))
      .subscribe(u => {
        this.updateUnreadMessageCount(u);
      });

    this.updateLastMessageReadSubscription =
    this.lastMessagesService.lastMessageUpdated.subscribe(x => {
      this.lastMessagesService.getUnreadConversationsNumber()
        .subscribe(u => this.updateUnreadMessageCount(u));
    });

    if (this.authService.isLoggedIn()) {
      this.lastMessagesService.getUnreadConversationsNumber()
        .subscribe(u => this.updateUnreadMessageCount(u));
    }
  }

  createFeedSocket() {
    if (this.authService.isLoggedIn()) {
      this.feedSocket = this.feedService.getFeedSocket(this.username);
      this.feedSocket
        .subscribe(data => {
          if (data.type && data.type.includes('message')) {
            this.feedService.newMessageSubject.next(data);
          }

          this.feedService.dataSubject.next(data);
        },
          () => {
            setTimeout(() => {
              this.createFeedSocket();
            }, 1000);
          });
    }
  }

  toggleMenuVisibility(): void {
    this.setDropDownVisible(!this.menuDropDownVisible);
  }

  setDropDownVisible(v: boolean, swipingFromRight: boolean = true) {
    if (!v) {
      this.transitionMenuMs = this.transitionMenuMsDefault / 2;
      this.transitionOverlayMs = this.transitionOverlayMsDefault / 2;
    }
    else {
      this.transitionMenuMs = this.transitionMenuMsDefault;
      this.transitionOverlayMs = this.transitionOverlayMsDefault;
    }

    this.menuDropDownVisible = v;

    this.menuWidth = this.menuWidthOpen;

    if (swipingFromRight) {
      this.menuLeft = this.menuDropDownVisible ? 0 : -this.menuWidthOpen - 5;
      this.updateMenuTranslateX();
    }

    this.overlayOpacity = this.menuDropDownVisible ? this.overlayOpacityDefault : 0;

    if (this.menuDropDownVisible) {
      this.elementRef.nativeElement.ownerDocument.body.style.overflow = 'hidden';
      this.overlayPointerEvents = 'all';

      setTimeout(() => this.transitionOverlayMs = 0, this.transitionMenuMsDefault);
    }
    else {
      this.resetBodyOverflow();
      setTimeout(() => this.overlayPointerEvents = 'none');

      this.transitionOverlayMs = this.transitionOverlayMsDefault;
    }
  }

  resetBodyOverflow() {
    this.elementRef.nativeElement.ownerDocument.body.style.overflow = null;
  }

  overlayClick(): void {
    if (this.menuDropDownVisible) {
      this.setDropDownVisible(false);
    }
  }

  touchStart(event) {
    this.transitionMenuMs = 0;
    this.transitionOverlayMs = 0;
    this.touchStartTime = (new Date()).getTime();
    this.touchStartClientX = event.touches[0].clientX;
    this.touchStartClientY = event.touches[0].clientY;
  }

  touchMove(event, swipingFromRight: boolean = false) {
    if (this.menuDropDownVisible) {
      const offsetX = this.touchStartClientX - event.touches[0].clientX;
      const offsetY = this.touchStartClientY - event.touches[0].clientY;

      if (!swipingFromRight && !this.isMovingDropdown && Math.abs(offsetY) > 5) {
        this.isScrolling = true;
      }

      if (this.isScrolling) {
        return;
      }

      if (offsetX == 0) {
        return;
      }

      this.isMovingDropdown = true;

      let newLeft = this.menuWidthOpen - ((100 * offsetX) / this.screenWidth);

      if (swipingFromRight) {
        newLeft -= this.menuWidthOpen;
      }

      if (newLeft <= this.menuWidthOpen) {
        this.menuLeft = -(this.menuWidthOpen - newLeft);
        this.updateMenuTranslateX();
      }

      let newOpacity = this.overlayOpacityDefault - ((this.overlayOpacityDefault * offsetX) / this.screenWidth);

      if (swipingFromRight) {
        newOpacity -= this.overlayOpacityDefault;
      }

      if (newOpacity <= this.overlayOpacityDefault) {
        this.overlayOpacity = newOpacity;
      }
    }
  }

  touchEnd(event) {
    const wasScrolling = this.isScrolling;

    this.isMovingDropdown = false;
    this.isScrolling = false;
    this.transitionMenuMs = this.transitionMenuMsDefault;
    this.transitionOverlayMs = this.transitionOverlayMsDefault;

    if (this.menuDropDownVisible && !wasScrolling) {
      if ((new Date()).getTime() - this.touchStartTime < this.thresholdCloseAnywayMs) {
        this.setDropDownVisible(false);
      }
      else {
        if ((this.menuWidthOpen + this.menuLeft) < this.menuWidthOpen / 2) {
          this.setDropDownVisible(false);
        }
        else {
          this.menuWidth = this.menuWidthOpen;
          this.menuLeft = 0;
          this.updateMenuTranslateX();
        }
      }
    }
  }

  touchStartInvisibleDrawer(event) {
    this.touchStart(event);

    this.setDropDownVisible(true, false);
    this.overlayOpacity = 0;
  }

  touchMoveInvisibleDrawer(event) {
    this.transitionMenuMs = 0;
    this.transitionOverlayMs = 0;

    this.touchMove(event, true);
  }

  touchEndInvisibleDrawer(event) {
    this.transitionMenuMs = this.transitionMenuMsDefault;
    this.transitionOverlayMs = this.transitionOverlayMsDefault;

    if (this.menuDropDownVisible) {
      if ((new Date()).getTime() - this.touchStartTime < this.thresholdCloseAnywayMs) {
        if (this.menuLeft > -this.menuWidthOpen) {
          this.setDropDownVisible(true);
        }
        else {
          this.setDropDownVisible(false);
        }
      }
      else {
        if ((this.menuWidthOpen + this.menuLeft) < this.menuWidthOpen / 2) {
          this.setDropDownVisible(false);
        }
        else {
          this.menuWidth = this.menuWidthOpen;
          this.menuLeft = 0;
          this.updateMenuTranslateX();
        }
      }
    }
  }

  touchBodyStart(event) {
    this.touchBodyStartTime = (new Date()).getTime();
    this.touchBodyStartPageY = event.touches[0].pageY;
    this.touchBodyMovePageY = event.touches[0].pageY;
  }

  touchBodyMove(event, invert: boolean = false) {
    this.touchBodyMovePageY = event.touches[0].pageY;
  }

  touchBodyEnd(event) {
    if (!environment.application) {
      return;
    }

    if (document.scrollingElement.scrollTop == 0 && this.touchBodyMovePageY > this.touchBodyStartPageY && !this.menuDropDownVisible) {
      this.refreshService.refresh();
    }
  }
}
