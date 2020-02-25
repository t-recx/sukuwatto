import { Component, OnInit } from '@angular/core';
import { Exercise } from '../exercise';
import { ActivatedRoute, Router } from '@angular/router';
import { ExercisesService } from '../exercises.service';

@Component({
  selector: 'app-exercise-detail',
  templateUrl: './exercise-detail.component.html',
  styleUrls: ['./exercise-detail.component.css']
})
export class ExerciseDetailComponent implements OnInit {
  exercise: Exercise;
  triedToSave: boolean;

  constructor(
    private route: ActivatedRoute,
    private service: ExercisesService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.triedToSave = false;

    this.route.paramMap.subscribe(params =>
      this.loadOrInitializeExercise(params.get('id')));
  }

  private loadOrInitializeExercise(id: string): void {
    if (id) {
      this.service.getExercise(id).subscribe(exercise => {
        this.exercise = exercise;
      });
    } else {
      this.exercise = new Exercise();
    }
  }

  save() {
    this.triedToSave = true;

    if (!this.valid(this.exercise)) {
      return;
    }

    this.service.saveExercise(this.exercise).subscribe(exercise => {
      this.triedToSave = false;

      this.router.navigate(['../../exercises'], {
        relativeTo: this.route,
      });
    });
  }

  valid(exercise: Exercise): boolean {
    return true;
  }
}
