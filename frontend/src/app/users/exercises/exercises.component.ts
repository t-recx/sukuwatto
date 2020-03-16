import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription, combineLatest } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { faDumbbell } from '@fortawesome/free-solid-svg-icons';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.css']
})
export class ExercisesComponent implements OnInit, OnDestroy {
  paramChangedSubscription: Subscription;
  queryParamChangedSubscription: Subscription;
  faDumbbell = faDumbbell;

  username: string;
  page: number;
  search: string;
  ordering: string;

  queryParams: {};

  constructor(
    private authService: AuthService,
    private router: Router,
    route: ActivatedRoute,
  ) { 
    this.paramChangedSubscription = combineLatest(route.paramMap, route.queryParamMap)
    .pipe(map(results => ({params: results[0], query: results[1]})))
    .subscribe(results => {
        this.loadParameterDependentData(results.params.get('username'),results.params.get('page'),
        results.query.get('search'), results.query.get('ordering'));
    });
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  ngOnInit() {
  }

  loadParameterDependentData(username: string, page: string, search: string, ordering: string) {
    this.username = username;
    this.page = +page;
    this.search = search;
    this.ordering = ordering;
    this.queryParams = this.getQueryParams();
  }

  getQueryParams() {
    let queryParams = {}
    
    if (this.search) {
      queryParams['search']= this.search;
    }

    if (this.ordering) {
      queryParams['ordering']= this.ordering;
    }

    return queryParams;
  }

  navigate(exercise) {
    this.router.navigate(['/users', this.authService.getUsername(), 'exercise', exercise.id]);
  }
}
