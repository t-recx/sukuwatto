import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Exercise, SectionLabel, ForceLabel, MechanicsLabel, ModalityLabel, LevelLabel, ExerciseTypeLabel } from '../exercise';
import { ExercisesService } from '../exercises.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-exercise-card',
  templateUrl: './exercise-card.component.html',
  styleUrls: ['./exercise-card.component.css']
})
export class ExerciseCardComponent implements OnInit, OnDestroy {
  @Input() exercise: Exercise;
  @Input() id: number;
  @Input() commentsSectionOpen: boolean = false;

  routerLink: any;
  shareTitle: string;
  shareLink: string;

  paramChangedSubscription: Subscription;
  username: string;

  ExerciseTypeLabel = ExerciseTypeLabel;
  SectionLabel = SectionLabel;
  ForceLabel = ForceLabel;
  MechanicsLabel = MechanicsLabel;
  ModalityLabel = ModalityLabel;
  LevelLabel = LevelLabel;

  constructor(
    private exercisesService: ExercisesService,
    route: ActivatedRoute,
    private router: Router,
  ) {
    this.paramChangedSubscription = route.paramMap.subscribe(val =>
      {
        this.username = val.get('username');
      });
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  ngOnInit(): void {
    if (!this.exercise && this.id) {
      this.exercisesService.getExercise(this.id).subscribe(e => {
        this.exercise = e;

        this.setupExercise(e);
      });
    }
    else {
      this.setupExercise(this.exercise);
    }
  }

  private setupExercise(e: Exercise) {
    this.routerLink = ['/users', this.username, 'exercise', this.exercise.id];
    this.shareTitle = 'sukuwatto: ' + e.name + ' exercise';
    this.shareLink = window.location.origin.replace('android.', 'www.') + this.router.createUrlTree(this.routerLink);
  }

  exerciseHasClassificationFields(): boolean {
    return this.exercise.mechanics != null || 
      this.exercise.section != null || 
      this.exercise.modality != null || 
      this.exercise.level != null || 
      this.exercise.force != null;
  }

  exerciseHasDescriptionFields(): boolean {
    return (this.exercise.description != null && this.exercise.description.trim().length > 0) || 
      (this.exercise.muscle != null && this.exercise.muscle.trim().length > 0);
  }
}
