import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Exercise } from '../exercise';
import { ActivatedRoute, Router } from '@angular/router';
import { ExercisesService } from '../exercises.service';
import { AuthService } from 'src/app/auth.service';
import { AlertService } from 'src/app/alert/alert.service';
import { faCircleNotch, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { CordovaService } from 'src/app/cordova.service';
import { Subscription } from 'rxjs';
import { SerializerUtilsService } from 'src/app/serializer-utils.service';

@Component({
  selector: 'app-exercise-detail',
  templateUrl: './exercise-detail.component.html',
  styleUrls: ['./exercise-detail.component.css']
})
export class ExerciseDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  exercise: Exercise;
  triedToSave: boolean;
  deleteModalVisible: boolean = false;
  userIsOwner: boolean = false;

  notFound: boolean = false;
  loading: boolean = false;
  saving: boolean = false;
  deleting: boolean = false;
  refreshExpired: boolean = false;

  faSave = faSave;
  faTrash = faTrash;
  faCircleNotch = faCircleNotch;

  pausedSubscription: Subscription;
  refreshExpiredSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private service: ExercisesService,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
    private loadingService: LoadingService,
    private cordovaService: CordovaService,
    private serializerUtils: SerializerUtilsService,
  ) { }

  ngAfterViewInit(): void {
    this.serializerUtils.restoreScrollPosition();
  }

  ngOnInit() {
    this.triedToSave = false;
    this.refreshExpired = false;

    this.route.paramMap.subscribe(params =>
      this.loadOrInitializeExercise(params.get('id')));

    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.serialize()) ;
    this.refreshExpiredSubscription = this.authService.refreshExpired.subscribe(x => {
      this.serialize();
      this.refreshExpired = true;
    });
  }

  ngOnDestroy(): void {
    this.pausedSubscription.unsubscribe();
    this.refreshExpiredSubscription.unsubscribe();

    if (!this.refreshExpired) {
      this.removeSerialization();
    }

    this.refreshExpired = false;
  }

  private removeSerialization() {
    localStorage.removeItem('state_exercise_has_state');
    localStorage.removeItem('state_exercise_detail_exercise');
    this.serializerUtils.removeScrollPosition();
  }

  serialize() {
    localStorage.setItem('state_exercise_has_state', JSON.stringify(true));
    localStorage.setItem('state_exercise_detail_exercise', JSON.stringify(this.exercise));
    this.serializerUtils.serializeScrollPosition();
  }

  restore(): boolean {
    const hasState = JSON.parse(localStorage.getItem('state_exercise_has_state'));

    if (!hasState) {
      return false;
    }

    const stateExercise = localStorage.getItem('state_exercise_detail_exercise');

    this.exercise = this.service.getProperlyTypedExercise(JSON.parse(stateExercise));

    this.checkOwnership();

    return true;
  }

  checkOwnership() {
    if (this.exercise.id && this.exercise.id > 0) {
      this.userIsOwner = (this.exercise.user && this.authService.isCurrentUserLoggedIn(this.exercise.user.username)) || this.authService.userIsStaff();
    }
    else {
      this.userIsOwner = true;
    }
  }

  private loadOrInitializeExercise(id: string): void {
    if (this.restore()) {
      return;
    }

    this.notFound = false;
    this.userIsOwner = false;
    this.refreshExpired = false;

    if (id) {
      this.loading = true;
      this.loadingService.load();
      this.service.getExercise(id).subscribe(exercise => {
        this.exercise = exercise;
        if (this.exercise) {
          this.checkOwnership();
        }
        else {
          this.notFound = true;
        }
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

    if (!this.service.valid(this.exercise)) {
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
