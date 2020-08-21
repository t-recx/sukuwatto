import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd } from '@angular/router';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { Subscription } from 'rxjs';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy, AfterViewInit {
  menuDropDownVisible: boolean = false;

  faBars = faBars;
  faTimes = faTimes;

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

  constructor(
    public authService: AuthService, 
    public route: ActivatedRoute, 
    private loadingService: LoadingService,
    private elementRef: ElementRef,
    ) { 
      this.onResize();
    }

  ngAfterViewInit(): void {
    this.loadingSubscription = this.loadingService.state.subscribe(s => setTimeout(() => this.loading = s));
  }

  ngOnDestroy(): void {
    this.resetBodyOverflow();
    this.loadingSubscription.unsubscribe();
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
}
