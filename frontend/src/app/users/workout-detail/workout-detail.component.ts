import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkoutsService } from '../workouts.service';

@Component({
  selector: 'app-workout-detail',
  templateUrl: './workout-detail.component.html',
  styleUrls: ['./workout-detail.component.css']
})
export class WorkoutDetailComponent implements OnInit, OnDestroy {

  paramChangedSubscription: Subscription;

  id: number;
  username: string;
  allowEdit: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private workoutsService: WorkoutsService,
  ) { }

  ngOnInit() {
    this.paramChangedSubscription = this.route.paramMap.subscribe(params => 
      {
        this.allowEdit = false;
        this.username = params.get('username');
        this.id = +params.get('id');

        if (this.authService.isLoggedIn()) {
          this.workoutsService.workoutEditable(this.id)
          .subscribe(editable => {
            this.allowEdit = editable;
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }
}
