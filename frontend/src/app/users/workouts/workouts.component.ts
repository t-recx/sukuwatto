import { Component, OnInit } from '@angular/core';
import { WorkoutsService } from '../workouts.service';
import { Workout } from '../workout';
import { AuthService } from 'src/app/auth.service';

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
  ) { }

  ngOnInit() {
    this.getWorkouts();
  }

  getWorkouts(): void {
    this.workoutsService.getWorkouts(this.authService.getUsername())
    .subscribe(workouts => this.workouts = workouts);
  }

  deleteWorkout(workout): void {
    this.workoutsService.deleteWorkout(workout).subscribe(_ => this.getWorkouts());
  }
}
