import { Component, Renderer2, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CordovaService } from './cordova.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit, OnDestroy {
  title = 'sukuwatto';

  pausedSubscription: Subscription;
  resumedSubscription: Subscription;

  constructor(
    private renderer: Renderer2,
    private cordovaService: CordovaService,
    private authService: AuthService,
    private router: Router) {
    if (environment.application) {
      const backgroundGeolocation = window['BackgroundGeolocation'];
      if (backgroundGeolocation) {
        this.router.events.subscribe(e => {
          if (e instanceof NavigationEnd &&
            (
              !this.urlIsWorkoutDetail(e.urlAfterRedirects) ||
              !this.urlIsWorkoutDetail(this.getUrlState())
            )) {
            // we're navigating away from the workout detail
            // so let's stop the background geolocation service
            // if for some reason it's still running
            backgroundGeolocation.checkStatus((status) => {
              if (status.isRunning) {
                backgroundGeolocation.stop();
              }
            });
          }
        });
      }
    }
  }

  ngOnInit(): void {
    this.restoreUrlState();

    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.saveUrlState());
    this.resumedSubscription = this.cordovaService.resumed.subscribe(() => this.restoreUrlState());
  }

  ngOnDestroy(): void {
    this.pausedSubscription.unsubscribe();
    this.resumedSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    if (environment.application) {
      // if we're on mobile then I'm displaying a loader element that I'll remove 
      // after the view initialized
      const loader = this.renderer.selectRootElement('#loader');
      this.renderer.setStyle(loader, 'display', 'none');
    }
  }

  saveUrlState() {
    localStorage.setItem('state_url', this.router.url);
  }

  restoreUrlState() {
    if (this.authService.isLoggedIn()) {
      const url = this.getUrlState();

      if (url && url.length > 0) {
        this.router.navigateByUrl(url);
        localStorage.removeItem('state_url');
      }
    }
  }

  getUrlState() {
    return localStorage.getItem('state_url');
  }

  urlIsWorkoutDetail(url: string) {
    return url.endsWith('/workout') || url.includes('/workout/') || url.endsWith('/quick-activity');
  }
}
