import { Component, OnInit, OnDestroy } from '@angular/core';
import { FeaturesService } from '../features.service';
import { Feature, FeatureState } from '../feature';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RepetitionType } from '../plan-session-group-activity';
import { Paginated } from '../paginated';
import { combineLatest, fromEvent, of, Subscription } from 'rxjs';
import { faBackspace, faCode, faFileCode, faSearch, faTasks } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ErrorService } from 'src/app/error.service';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit, OnDestroy {
  faCode = faCode;

  paramChangedSubscription: Subscription;

  searchFilter: string;
  queryParams: {};
  username: string;

  page: string;

  constructor(
    public route: ActivatedRoute, 
    private authService: AuthService,
  ) { 
    this.paramChangedSubscription = combineLatest(this.route.paramMap, this.route.queryParamMap)
    .pipe(map(results => ({params: results[0], query: results[1]})))
    .subscribe(results => {
      this.username = results.params.get('username');
      this.searchFilter = results.query.get('search');
      this.page = results.params.get('page');
      this.queryParams = results.params;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }
}

