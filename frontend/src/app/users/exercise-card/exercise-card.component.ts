import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Exercise, SectionLabel, ForceLabel, MechanicsLabel, ModalityLabel, LevelLabel, ExerciseTypeLabel } from '../exercise';
import { ExercisesService } from '../exercises.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/auth.service';
import { LanguageService } from 'src/app/language.service';

@Component({
  selector: 'app-exercise-card',
  templateUrl: './exercise-card.component.html',
  styleUrls: ['./exercise-card.component.css']
})
export class ExerciseCardComponent implements OnInit, OnDestroy {
  @Input() exercise: Exercise;
  @Input() id: number;
  @Input() detailView: boolean;
  @Input() commentsSectionOpen: boolean = false;

  routerLink: any;
  shareTitle: string;
  shareLink: string;

  paramChangedSubscription: Subscription;
  languageChangedSubscription: Subscription;
  username: string;

  ExerciseTypeLabel = ExerciseTypeLabel;
  SectionLabel = SectionLabel;
  ForceLabel = ForceLabel;
  MechanicsLabel = MechanicsLabel;
  ModalityLabel = ModalityLabel;
  LevelLabel = LevelLabel;

  constructor(
    private exercisesService: ExercisesService,
    private translate: TranslateService,
    private languageService: LanguageService,
    route: ActivatedRoute,
    private router: Router,
  ) {
    this.paramChangedSubscription = route.paramMap.subscribe(val =>
      {
        this.username = val.get('username');
      });

    this.languageChangedSubscription = languageService.languageChanged.subscribe(x => {
      this.updateShareTitle(this.exercise);
    });
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
    this.languageChangedSubscription.unsubscribe();
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
    if (!e) {
      return;
    }

    this.routerLink = ['/users', this.username, 'exercise', this.exercise.id];

    this.updateShareTitle(e);

    this.shareLink = window.location.origin.replace('android.', 'www.') + this.router.createUrlTree(this.routerLink);
  }

  updateShareTitle(e: Exercise) {
    if (e) {
      const name = this.languageService.getLanguage() == 'pt' ? e.name_pt : e.name;

      this.translate.get('sukuwatto: {{exercise_name}} exercise', {exercise_name: name}).subscribe(res => {
        this.shareTitle = res;
      });
    }
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
    (this.exercise.muscles && this.exercise.muscles.length > 0);
  }
}
