import { Component, OnInit } from '@angular/core';
import { Exercise } from '../exercise';
import { ActivatedRoute, Router } from '@angular/router';
import { ExercisesService } from '../exercises.service';
import { AuthService } from 'src/app/auth.service';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-exercise-detail',
  templateUrl: './exercise-detail.component.html',
  styleUrls: ['./exercise-detail.component.css']
})
export class ExerciseDetailComponent implements OnInit {
  exercise: Exercise;
  triedToSave: boolean;
  deleteModalVisible: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private service: ExercisesService,
    private authService: AuthService,
    private alertService: AlertService,
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

    if (this.exercise.id && this.exercise.id > 0) {
      this.service.exerciseInUseOnOtherUsersResources(this.exercise).subscribe(inUse => {
        if (inUse) {
          this.alertService.error('Unable to update: Exercise in use on other users\' resources');
        } else {
          this.saveExercise();
        }
      });
    }
    else {
      this.saveExercise();
    }
  }

  saveExercise() {
    this.service.saveExercise(this.exercise).subscribe(exercise => {
      this.triedToSave = false;

      this.navigateToList();
    });
  }

  valid(exercise: Exercise): boolean {
    if (!exercise.name || exercise.name.trim().length == 0) {
      return false;
    }

    return true;
  }

  delete() {
    this.hideDeleteModal();

    this.service.exerciseInUse(this.exercise).subscribe(inUse =>
      {
        if (inUse) {
          this.alertService.error('Unable to delete: Exercise in use on other resources');
        } else {
          this.service.deleteExercise(this.exercise).subscribe(e => {
            this.navigateToList();
          });
        }
      });
  }

  navigateToList() {
    this.router.navigate(['/users', this.authService.getUsername(), 'exercises'], {
      relativeTo: this.route,
    });
  }

  showDeleteModal() {
    this.deleteModalVisible = true;
  }

  hideDeleteModal() {
    this.deleteModalVisible = false;
  }

  showDeleteButton() {
    if (this.exercise.id &&
      this.authService.isLoggedIn() && 
      this.exercise.user == +this.authService.getUserId()) {
        return true;
      }

    return false;
  }

  showSaveButton() {
    if (!this.exercise || !this.exercise.id || this.exercise.id <= 0) {
      return true;
    }

    return this.showDeleteButton();
  }
}
