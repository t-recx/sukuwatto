import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ApplicationRef } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd } from '@angular/router';
import { faBars, faTimes, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { concat, interval, Subscription } from 'rxjs';
import { HostListener } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { RefreshService } from '../refresh.service';
import { environment } from 'src/environments/environment';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy, AfterViewInit {
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

  updateMenuTranslateX() {
    this.menuTranslateX = 'translate(' + this.menuLeft + 'vw)';
  }

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

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    if (!this.menuDropDownVisible) {
      this.dropDownHidden = true;
      setTimeout(() => this.dropDownHidden = false, this.transitionMenuMsDefault);
    }

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

  constructor(
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
      if (e instanceof NavigationEnd) {
        if (this.menuDropDownVisible) {
          this.setDropDownVisible(false);
        }
      }
    });

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

  updateApplication() {
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }

  dismissUpdateNotification() {
    this.updateSnackbarVisible = false;
  }

  ngAfterViewInit(): void {
    this.loadingSubscription = this.loadingService.state.subscribe(s => setTimeout(() => this.loading = s));
  }

  ngOnDestroy(): void {
    this.resetBodyOverflow();
    this.loadingSubscription.unsubscribe();
    this.routerNavigationSubscription.unsubscribe();

    if (this.checkForUpdatesProgramatically) {
      this.updateAvailableSubscription.unsubscribe();
      this.checkUpdatesSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.username = this.authService.getUsername();
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

  touchMove(event, invert: boolean = false) {
    if (this.menuDropDownVisible) {
      const offsetX = this.touchStartClientX - event.touches[0].clientX;
      const offsetY = this.touchStartClientY - event.touches[0].clientY;

      if (!this.isMovingDropdown && Math.abs(offsetY) > 5) {
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

      if (invert) {
        newLeft -= this.menuWidthOpen;
      }

      if (newLeft <= this.menuWidthOpen) {
        this.menuLeft = -(this.menuWidthOpen - newLeft);
        this.updateMenuTranslateX();
      }

      let newOpacity = this.overlayOpacityDefault - ((this.overlayOpacityDefault * offsetX) / this.screenWidth);

      if (invert) {
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

    if (document.scrollingElement.scrollTop == 0 && this.touchBodyMovePageY > this.touchBodyStartPageY) {
      this.refreshService.refresh();
    }
  }
}
