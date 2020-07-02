import { Component, OnInit } from '@angular/core';
import { Exercise } from '../exercise';
import { ActivatedRoute, Router } from '@angular/router';
import { ExercisesService } from '../exercises.service';
import { AuthService } from 'src/app/auth.service';
import { AlertService } from 'src/app/alert/alert.service';
import { faCircleNotch, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-exercise-detail',
  templateUrl: './exercise-detail.component.html',
  styleUrls: ['./exercise-detail.component.css']
})
export class ExerciseDetailComponent implements OnInit {
  exercise: Exercise;
  triedToSave: boolean;
  deleteModalVisible: boolean = false;
  userIsOwner: boolean = false;

  loading: boolean = false;
  saving: boolean = false;
  deleting: boolean = false;

  faSave = faSave;
  faTrash = faTrash;
  faCircleNotch = faCircleNotch;

  constructor(
    private route: ActivatedRoute,
    private service: ExercisesService,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
    this.triedToSave = false;

    this.route.paramMap.subscribe(params =>
      this.loadOrInitializeExercise(params.get('id')));
  }

  private loadOrInitializeExercise(id: string): void {
    if (id) {
      this.loading = true;
      this.loadingService.load();
      this.service.getExercise(id).subscribe(exercise => {
        this.exercise = exercise;
        this.userIsOwner = this.exercise.user && this.authService.isCurrentUserLoggedIn(this.exercise.user.username);
        this.loading = false;
        this.loadingService.unload();
      });
    } else {
      this.exercise = new Exercise();
      this.userIsOwner = true;
    }
  }

  save() {
    this.triedToSave = true;

    if (!this.valid(this.exercise)) {
      this.alertService.warn('Please fill all required fields and try again');
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
    this.saving = true;

    this.service.saveExercise(this.exercise).subscribe(exercise => {
      this.triedToSave = false;
      this.saving = false;

      if (exercise) {
        this.navigateToList();
      }
    });
  }

  valid(exercise: Exercise): boolean {
    if (!exercise.short_name || exercise.short_name.trim().length == 0) {
      return false;
    }

    if (!exercise.name || exercise.name.trim().length == 0) {
      return false;
    }

    if (!exercise.exercise_type) {
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
          this.deleting = true;
          this.service.deleteExercise(this.exercise).subscribe(e => {
            this.deleting = false;
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
      if (this.exercise &&
          this.exercise.id &&
      this.authService.isLoggedIn() && 
      (this.authService.userIsStaff() || (this.exercise.user && this.exercise.user.id == +this.authService.getUserId()))) {
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
