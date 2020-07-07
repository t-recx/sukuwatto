import { Component, Renderer2, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CordovaService } from './cordova.service';
import { Router } from '@angular/router';
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
      const url = localStorage.getItem('state_url');

      if (url && url.length > 0) {
        this.router.navigateByUrl(url);
        localStorage.removeItem('state_url');
      }
    }
  }
}
