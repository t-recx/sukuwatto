import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LanguageService } from './language.service';
import { TierLabel, Tier, MeasurementSystem, MeasurementSystemLabel } from './user';
import { ExerciseTypeLabel, ExerciseType, Mechanics, MechanicsLabel, Force, ForceLabel, Modality, ModalityLabel, SectionLabel, Section, Level, LevelLabel } from './users/exercise';
import { FeatureStateLabel, FeatureState } from './users/feature';
import { MuscleRoleLabel, MuscleRole } from './users/muscle-exercise';
import { ParameterType, ParameterTypeLabel, ProgressionType, ProgressionTypeLabel } from './users/plan-progression-strategy';
import { RepetitionTypeLabel, RepetitionType, SpeedTypeLabel, SpeedType, Vo2MaxTypeLabel, Vo2MaxType, DistanceTypeLabel, DistanceType, TimeType, TimeTypeLabel } from './users/plan-session-group-activity';
import { ReleaseStateLabel, ReleaseState } from './users/release';
import { MeasurementTypeLabel, MeasurementType } from './users/unit';
import { WorkoutStatusLabel, WorkoutStatus } from './users/workout';
import { VisibilityLabel, Visibility } from './visibility';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Injectable({
  providedIn: 'root'
})
export class TranslationUpdatesService implements OnDestroy {

  languageChangedSubscription: Subscription;

  constructor(
    private languageService: LanguageService,
    private translateService: TranslateService,
  ) {
    this.languageChangedSubscription = this.languageService.languageChanged.subscribe(language => {
      this.translate(language);
    });
    this.markStatic();
  }

  markStatic() {
    marker('The password is too similar to the username.');
    marker('This password is too short. It must contain at least 8 characters.');
    marker('This password is too common.');
    marker('This password is entirely numeric.');
    marker('Enter a valid email address.');
    marker('A user with that username already exists.');
    marker('The password is too similar to the email.');

    marker('Compound exercises');
    marker('Isolation exercises');
    marker('Body composition');
    marker('Distance');

    marker('Monday\'s session');
    marker('Tuesday\'s session');
    marker('Wednesday\'s session');
    marker('Thursday\'s session');
    marker('Friday\'s session');
    marker('Saturday\'s session');
    marker('Sunday\'s session');

    marker('Sessão de segunda-feira');
    marker('Sessão de terça-feira');
    marker('Sessão de quarta-feira');
    marker('Sessão de quinta-feira');
    marker('Sessão de sexta-feira');
    marker('Sessão de sábado');
    marker('Sessão de domingo');
  }

  ngOnDestroy(): void {
    if (this.languageChangedSubscription) {
      this.languageChangedSubscription.unsubscribe();
    }
  }

  translate(language) {
    this.translateService.get('Weight').subscribe((res: string) => {
      ParameterTypeLabel.set(ParameterType.Weight, res);
    });
    this.translateService.get('Distance').subscribe((res: string) => {
      ParameterTypeLabel.set(ParameterType.Distance, res);
    });
    this.translateService.get('Time').subscribe((res: string) => {
      ParameterTypeLabel.set(ParameterType.Time, res);
    });
    this.translateService.get('Speed').subscribe((res: string) => {
      ParameterTypeLabel.set(ParameterType.Speed, res);
    });

    this.translateService.get('By Exercise').subscribe((res: string) => {
      ProgressionTypeLabel.set(ProgressionType.ByExercise, res);
    });
    this.translateService.get('By Characteristics').subscribe((res: string) => {
      ProgressionTypeLabel.set(ProgressionType.ByCharacteristics, res);
    });

    this.translateService.get('Novice').subscribe((res: string) => {
      TierLabel.set(Tier.Novice, res);
    });
    this.translateService.get('Intermediate').subscribe((res: string) => {
      TierLabel.set(Tier.Intermediate, res);
    });
    this.translateService.get('Advanced').subscribe((res: string) => {
      TierLabel.set(Tier.Advanced, res);
    });

    this.translateService.get('Metric').subscribe((res: string) => {
      MeasurementSystemLabel.set(MeasurementSystem.Metric, res);
    });
    this.translateService.get('Imperial').subscribe((res: string) => {
      MeasurementSystemLabel.set(MeasurementSystem.Imperial, res);
    });

    this.translateService.get('Everyone').subscribe((res: string) => {
      VisibilityLabel.set(Visibility.Everyone, res);
    });
    this.translateService.get('Registered users').subscribe((res: string) => {
      VisibilityLabel.set(Visibility.RegisteredUsers, res);
    });
    this.translateService.get('Followers').subscribe((res: string) => {
      VisibilityLabel.set(Visibility.Followers, res);
    });
    this.translateService.get('Just me').subscribe((res: string) => {
      VisibilityLabel.set(Visibility.OwnUser, res);
    });

    this.translateService.get('Cardio').subscribe((res: string) => {
      ExerciseTypeLabel.set(ExerciseType.Cardio, res);
    });
    this.translateService.get('Strength').subscribe((res: string) => {
      ExerciseTypeLabel.set(ExerciseType.Strength, res);
    });

    this.translateService.get('Compound').subscribe((res: string) => {
      MechanicsLabel.set(Mechanics.Compound, res);
    });
    this.translateService.get('Isolated').subscribe((res: string) => {
      MechanicsLabel.set(Mechanics.Isolated, res);
    });

    this.translateService.get('Pull').subscribe((res: string) => {
      ForceLabel.set(Force.Pull, res);
    });
    this.translateService.get('Push').subscribe((res: string) => {
      ForceLabel.set(Force.Push, res);
    });
    this.translateService.get('Static').subscribe((res: string) => {
      ForceLabel.set(Force.Static, res);
    });
    this.translateService.get('Pull and push').subscribe((res: string) => {
      ForceLabel.set(Force.PullPush, res);
    });

    this.translateService.get('Free weights').subscribe((res: string) => {
      ModalityLabel.set(Modality.FreeWeights, res);
    });
    this.translateService.get('Machine').subscribe((res: string) => {
      ModalityLabel.set(Modality.Machine, res);
    });
    this.translateService.get('Cable').subscribe((res: string) => {
      ModalityLabel.set(Modality.Cable, res);
    });
    this.translateService.get('Calisthenics').subscribe((res: string) => {
      ModalityLabel.set(Modality.Calisthenics, res);
    });

    this.translateService.get('Upper').subscribe((res: string) => {
      SectionLabel.set(Section.Upper, res);
    });
    this.translateService.get('Lower').subscribe((res: string) => {
      SectionLabel.set(Section.Lower, res);
    });
    this.translateService.get('Core').subscribe((res: string) => {
      SectionLabel.set(Section.Core, res);
    });

    this.translateService.get('Advanced').subscribe((res: string) => {
      LevelLabel.set(Level.Advanced, res);
    });
    this.translateService.get('Beginner').subscribe((res: string) => {
      LevelLabel.set(Level.Beginner, res);
    });
    this.translateService.get('Intermediate').subscribe((res: string) => {
      LevelLabel.set(Level.Intermediate, res);
    });

    this.translateService.get('Open').subscribe((res: string) => {
      FeatureStateLabel.set(FeatureState.Open, res);
    });
    this.translateService.get('In progress').subscribe((res: string) => {
      FeatureStateLabel.set(FeatureState.InProgress, res);
    });
    this.translateService.get('Done').subscribe((res: string) => {
      FeatureStateLabel.set(FeatureState.Done, res);
    });
    this.translateService.get('Closed').subscribe((res: string) => {
      FeatureStateLabel.set(FeatureState.Closed, res);
    });

    this.translateService.get('Agonist').subscribe((res: string) => {
      MuscleRoleLabel.set(MuscleRole.Agonist, res);
    });
    this.translateService.get('Antagonist').subscribe((res: string) => {
      MuscleRoleLabel.set(MuscleRole.Antagonist, res);
    });
    this.translateService.get('Synergist').subscribe((res: string) => {
      MuscleRoleLabel.set(MuscleRole.Synergist, res);
    });
    this.translateService.get('Fixator').subscribe((res: string) => {
      MuscleRoleLabel.set(MuscleRole.Fixator, res);
    });
    this.translateService.get('Target').subscribe((res: string) => {
      MuscleRoleLabel.set(MuscleRole.Target, res);
    });
    this.translateService.get('Dynamic stabilizer').subscribe((res: string) => {
      MuscleRoleLabel.set(MuscleRole.DynamicStabilizer, res);
    });
    this.translateService.get('Antagonist stabilizer').subscribe((res: string) => {
      MuscleRoleLabel.set(MuscleRole.AntagonistStabilizer, res);
    });

    this.translateService.get('Standard').subscribe((res: string) => {
      RepetitionTypeLabel.set(RepetitionType.Standard, res);
    });
    this.translateService.get('Range').subscribe((res: string) => {
      RepetitionTypeLabel.set(RepetitionType.Range, res);
    });
    this.translateService.get('To Failure').subscribe((res: string) => {
      RepetitionTypeLabel.set(RepetitionType.ToFailure, res);
    });
    this.translateService.get('AMRAP').subscribe((res: string) => {
      RepetitionTypeLabel.set(RepetitionType.AMRAP, res);
    });
    this.translateService.get('None').subscribe((res: string) => {
      RepetitionTypeLabel.set(RepetitionType.None, res);
    });

    this.translateService.get('None').subscribe((res: string) => {
      SpeedTypeLabel.set(SpeedType.None, res);
    });
    this.translateService.get('Standard').subscribe((res: string) => {
      SpeedTypeLabel.set(SpeedType.Standard, res);
    });
    this.translateService.get('Range').subscribe((res: string) => {
      SpeedTypeLabel.set(SpeedType.Range, res);
    });
    this.translateService.get('As fast as possible').subscribe((res: string) => {
      SpeedTypeLabel.set(SpeedType.AFAP, res);
    });
    this.translateService.get('Parameterized').subscribe((res: string) => {
      SpeedTypeLabel.set(SpeedType.Parameter, res);
    });

    this.translateService.get('None').subscribe((res: string) => {
      Vo2MaxTypeLabel.set(Vo2MaxType.None, res);
    });
    this.translateService.get('Standard').subscribe((res: string) => {
      Vo2MaxTypeLabel.set(Vo2MaxType.Standard, res);
    });
    this.translateService.get('Range').subscribe((res: string) => {
      Vo2MaxTypeLabel.set(Vo2MaxType.Range, res);
    });

    this.translateService.get('None').subscribe((res: string) => {
      DistanceTypeLabel.set(DistanceType.None, res);
    });
    this.translateService.get('Standard').subscribe((res: string) => {
      DistanceTypeLabel.set(DistanceType.Standard, res);
    });
    this.translateService.get('Range').subscribe((res: string) => {
      DistanceTypeLabel.set(DistanceType.Range, res);
    });
    this.translateService.get('Parameterized').subscribe((res: string) => {
      DistanceTypeLabel.set(DistanceType.Parameter, res);
    });

    this.translateService.get('None').subscribe((res: string) => {
      TimeTypeLabel.set(TimeType.None, res);
    });
    this.translateService.get('Standard').subscribe((res: string) => {
      TimeTypeLabel.set(TimeType.Standard, res);
    });
    this.translateService.get('Range').subscribe((res: string) => {
      TimeTypeLabel.set(TimeType.Range, res);
    });
    this.translateService.get('Parameterized').subscribe((res: string) => {
      TimeTypeLabel.set(TimeType.Parameter, res);
    });

    this.translateService.get('Done').subscribe((res: string) => {
      ReleaseStateLabel.set(ReleaseState.Done, res);
    });
    this.translateService.get('In progress').subscribe((res: string) => {
      ReleaseStateLabel.set(ReleaseState.InProgress, res);
    });

    this.translateService.get('Weight').subscribe((res: string) => {
      MeasurementTypeLabel.set(MeasurementType.Weight, res);
    });
    this.translateService.get('Distance').subscribe((res: string) => {
      MeasurementTypeLabel.set(MeasurementType.Distance, res);
    });
    this.translateService.get('Time').subscribe((res: string) => {
      MeasurementTypeLabel.set(MeasurementType.Time, res);
    });
    this.translateService.get('Speed').subscribe((res: string) => {
      MeasurementTypeLabel.set(MeasurementType.Speed, res);
    });
    this.translateService.get('Height').subscribe((res: string) => {
      MeasurementTypeLabel.set(MeasurementType.Height, res);
    });
    this.translateService.get('Energy').subscribe((res: string) => {
      MeasurementTypeLabel.set(MeasurementType.Energy, res);
    });

    this.translateService.get('In progress').subscribe((res: string) => {
      WorkoutStatusLabel.set(WorkoutStatus.InProgress, res);
    });
    this.translateService.get('Finished').subscribe((res: string) => {
      WorkoutStatusLabel.set(WorkoutStatus.Finished, res);
    });
  }
}
