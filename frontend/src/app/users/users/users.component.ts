import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd } from '@angular/router';
import { faBars, faTimes, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { Subscription } from 'rxjs';
import { HostListener } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { RefreshService } from '../refresh.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy, AfterViewInit {
  menuDropDownVisible: boolean = false;

  faBars = faBars;
  faTimes = faTimes;
  faSyncAlt = faSyncAlt;

  touchBodyStartTime: number;
  touchBodyStartPageY = 0;
  touchBodyMovePageY = 0;

  refreshing: boolean = false;
  refreshTop: number = -36;

  username: string;
  loading = false;
  loadingSubscription: Subscription;
  menuWidth = 0;
  menuWidthOpen = 85;
  overlayPointerEvents = 'none';

  menuLeft = -this.menuWidthOpen;

  screenWidth = 0;
  screenHeight = 0;
  transitionMenuMsDefault = 150;
  transitionMenuMs = this.transitionMenuMsDefault;
  transitionOverlayMsDefault = 250;
  transitionOverlayMs = this.transitionOverlayMsDefault;
  overlayOpacityDefault = 40;
  overlayOpacity = 0;
  touchStartTime = 0;
  thresholdCloseAnywayMs = 200;
  touchStartClientX = 0;

  routerNavigationSubscription: Subscription;
  checkUpdateSubscription: Subscription;
  applicationUpdateDismissedDate: Date = null;
  updateSnackbarVisible = false;

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;

    if (this.screenWidth > this.screenHeight || this.screenWidth > 600) {
      this.menuWidthOpen = 45;
    }
    else {
      this.menuWidthOpen = 85;
    }

    this.menuWidth = this.menuDropDownVisible ? this.menuWidthOpen : 0;
    this.menuLeft = !this.menuDropDownVisible ? -this.menuWidthOpen : 0;
  }

  refreshingSubscription: Subscription;
  refreshedSubscription: Subscription;

  constructor(
    public authService: AuthService,
    public route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private elementRef: ElementRef,
    private refreshService: RefreshService,
    swUpdate: SwUpdate,
  ) {
    this.refreshingSubscription = refreshService.refreshing.subscribe(() => {
      this.refreshing = true;
      this.refreshTop = 13;

      setTimeout(() => {
        location.reload();
        this.refreshService.finish();
      }, 250);
    });

    this.refreshedSubscription = refreshService.refreshed.subscribe(() => {
      this.refreshing = false;
      this.refreshTop = -36;
    });

    this.routerNavigationSubscription = this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        if (this.menuDropDownVisible) {
          this.setDropDownVisible(false);
        }
      }
    });

    this.checkUpdateSubscription = swUpdate.available.subscribe(x => {
      let v = true;

      if (this.applicationUpdateDismissedDate) {
        v = (new Date()).valueOf() - this.applicationUpdateDismissedDate.valueOf() > 3600000;

        if (!v) {
          this.applicationUpdateDismissedDate = null;
        }
      }

      this.updateSnackbarVisible = v;
    });

    this.onResize();
  }

  updateApplication() {
    window.location.reload();
  }

  dismissUpdateNotification() {
    this.applicationUpdateDismissedDate = new Date();
    this.updateSnackbarVisible = false;
  }

  ngAfterViewInit(): void {
    this.loadingSubscription = this.loadingService.state.subscribe(s => setTimeout(() => this.loading = s));
  }

  ngOnDestroy(): void {
    this.resetBodyOverflow();
    this.loadingSubscription.unsubscribe();
    this.checkUpdateSubscription.unsubscribe();
    this.routerNavigationSubscription.unsubscribe();
    this.refreshingSubscription.unsubscribe();
    this.refreshedSubscription.unsubscribe();
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

    this.menuWidth = this.menuDropDownVisible ? this.menuWidthOpen : 0;

    if (swipingFromRight) {
      this.menuLeft = this.menuDropDownVisible ? 0 : -this.menuWidthOpen;
    }

    this.overlayOpacity = this.menuDropDownVisible ? this.overlayOpacityDefault : 0;

    if (this.menuDropDownVisible) {
      this.elementRef.nativeElement.ownerDocument.body.style.overflow = 'hidden';
      this.overlayPointerEvents = 'all';
    }
    else {
      this.resetBodyOverflow();
      setTimeout(() => this.overlayPointerEvents = 'none');
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
  }

  touchMove(event, invert: boolean = false) {
    if (this.menuDropDownVisible) {
      const offsetX = this.touchStartClientX - event.touches[0].clientX;

      let newLeft = this.menuWidthOpen - ((100 * offsetX) / this.screenWidth);

      if (invert) {
        newLeft -= this.menuWidthOpen;
      }

      if (newLeft <= this.menuWidthOpen) {
        this.menuLeft = -(this.menuWidthOpen - newLeft);
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
    this.transitionMenuMs = this.transitionMenuMsDefault;
    this.transitionOverlayMs = this.transitionOverlayMsDefault;

    if (this.menuDropDownVisible) {
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
        }
      }
    }
  }

  touchBodyStart(event) {
    this.touchBodyStartTime = (new Date()).getTime();
    this.touchBodyStartPageY = event.touches[0].pageY;
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
