import { Component, OnInit } from '@angular/core';
import { WorkoutsService } from '../workouts.service';
import { Workout } from '../workout';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.component.html',
  styleUrls: ['./workouts.component.css']
})
export class WorkoutsComponent implements OnInit {
  workouts: Workout[];

  constructor(
    private workoutsService: WorkoutsService,
    private authService: AuthService,
    public route: ActivatedRoute, 
  ) { }

  ngOnInit() {
    this.getWorkouts();
  }

  getWorkouts(): void {
    let username= this.route.snapshot.paramMap.get('username');

    if (!username || username.length == 0) {
      username = this.authService.getUsername();
    }

    if (username) {
      this.workoutsService.getWorkouts(username)
        .subscribe(workouts => this.workouts = workouts);
    }
  }

  deleteWorkout(workout): void {
    this.workoutsService.deleteWorkout(workout).subscribe(_ => this.getWorkouts());
  }
}
