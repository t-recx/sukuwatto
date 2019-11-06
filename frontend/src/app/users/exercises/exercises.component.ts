import { Component, OnInit, OnDestroy } from '@angular/core';
import { Exercise } from '../exercise';
import { ExercisesService } from '../exercises.service';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.css']
})
export class ExercisesComponent implements OnInit, OnDestroy {
  exercises: Exercise[];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<Exercise[]> = new Subject<Exercise[]>();

  constructor(
    private exercisesService: ExercisesService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.dtOptions = {
      pageLength: 10
    };

    this.exercisesService.getExercises().subscribe(exercises => {
       this.exercises = exercises;
       this.dtTrigger.next(this.exercises)
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
