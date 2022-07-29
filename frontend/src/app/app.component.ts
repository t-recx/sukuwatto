import { Component, Renderer2, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CordovaService } from './cordova.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { LanguageService } from './language.service';
import { TranslationUpdatesService } from './translation-updates.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit, OnDestroy {
  title = 'sukuwatto';

  pausedSubscription: Subscription;

  constructor(
    private translationUpdatesService: TranslationUpdatesService,
    private renderer: Renderer2,
    private cordovaService: CordovaService,
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService) {
    this.languageService.startUp();
  }

  ngOnInit(): void {
    this.restoreUrlState();

    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.saveUrlState());
  }

  ngOnDestroy(): void {
    this.pausedSubscription.unsubscribe();
  }

  ngAfterViewInit() {

  }

  saveUrlState() {
    localStorage.setItem('state_url', this.router.url);
  }

  restoreUrlState() {
    const url = this.getUrlState();

    if (this.authService.isLoggedIn() && this.router.url != url) {
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
