import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
export class ExercisesComponent implements OnInit, OnDestroy, AfterViewInit {
  paramChangedSubscription: Subscription;
  queryParamChangedSubscription: Subscription;
  faDumbbell = faDumbbell;

  username: string;
  page: number;
  search: string;
  ordering: string;
  exerciseType: string;

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
        results.query.get('search'), results.query.get('ordering'), results.query.get('type'));
    });
  }

  ngAfterViewInit(): void {
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  ngOnInit() {
  }

  loadParameterDependentData(username: string, page: string, search: string, ordering: string, exerciseType: string) {
    this.username = username;
    this.page = +page;
    this.search = search;
    this.ordering = ordering;
    this.exerciseType = exerciseType;
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

    if (this.exerciseType) {
      queryParams['type']= this.exerciseType;
    }

    return queryParams;
  }

  navigate(exercise) {
    this.router.navigate(['/users', this.username, 'exercise', exercise.id]);
  }
}
