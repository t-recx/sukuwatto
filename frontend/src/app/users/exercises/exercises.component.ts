import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { faDumbbell } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.css']
})
export class ExercisesComponent implements OnInit, OnDestroy {
  paramChangedSubscription: Subscription;
  faDumbbell = faDumbbell;

  username: string;
  page: number;

  constructor(
    private authService: AuthService,
    private router: Router,
    route: ActivatedRoute,
  ) { 
    this.paramChangedSubscription = route.paramMap.subscribe(val =>
      {
        this.loadParameterDependentData(val.get('username'), val.get('page'));
      });
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  ngOnInit() {
  }

  loadParameterDependentData(username: string, page: string) {
    this.username = username;
    this.page = +page;
  }

  navigate(exercise) {
    this.router.navigate(['/users', this.authService.getUsername(), 'exercise', exercise.id]);
  }
}
