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

    marker('Monday\'s measurement');
    marker('Tuesday\'s measurement');
    marker('Wednesday\'s measurement');
    marker('Thursday\'s measurement');
    marker('Friday\'s measurement');
    marker('Saturday\'s measurement');
    marker('Sunday\'s measurement');

    marker('Sessão de segunda-feira');
    marker('Sessão de terça-feira');
    marker('Sessão de quarta-feira');
    marker('Sessão de quinta-feira');
    marker('Sessão de sexta-feira');
    marker('Sessão de sábado');
    marker('Sessão de domingo');

    marker('Incorrect username or password');
    marker('Unable to sign in, try again later');
    marker('Unable to sign out, try again later');
    marker('Unable to request data, try again later');
    marker('Unable to reset password, try again later');
    marker('Unable to delete user, try again later');
    marker('Unable to check user existence');
    marker('Unable to fetch user');
    marker('Unable to validate password');
    marker('Unable to fetch user email');
    marker('Unable to fetch user profile filename');
    marker('Unable to submit email, try again later');
    marker('Invalid or expired token');
    marker('Unable to sign up, try again later');
    marker('Unable to fetch comments');
    marker('Unable to fetch comment');
    marker('Unable to fetch content types');
    marker('Unable to fetch content types');
    marker('Unable to fetch exercise');
    marker('Unable to create exercise, try again later');
    marker('Unable to update exercise, try again later');
    marker('Unable to delete exercise, try again later');
    marker('Unable to check if exercise in use');
    marker('Unable to check if exercise in use on other users resources');
    marker('Unable to fetch feature');
    marker('Unable to toggle feature, try again later');
    marker('Unable to create feature, try again later');
    marker('Unable to update feature: it\'s already associated with a release');
    marker('You don\'t have permission to update this feature');
    marker('Unable to update feature, try again later');
    marker('Unable to delete feature: it\'s already associated with a release');
    marker('You don\'t have permission to delete this feature');
    marker('Unable to delete feature, try again later');
    marker("Unable to upload file, file exceeds maximum size");
    marker("Unable to upload file, is it a valid image file?");
    marker('Unable to upload file, try again later');
    marker('Unable to follow, try again later');
    marker('Unable to approve follow request, try again later');
    marker('Unable to reject follow request, try again later');
    marker('Unable to unfollow, try again later');
    marker('Unable to fetch is following');
    marker('Unable to fetch follow requests');
    marker('Unable to fetch follow request number');
    marker('Unable to fetch last messages');
    marker('Unable to update last message read');
    marker('Unable to fetch leaderboard positions');
    marker('Unable to fetch messages');
    marker('Unable to fetch metabolic equivalent tasks');
    marker('Unable to fetch muscles');
    marker('Unable to fetch is adopted');
    marker('Unable to fetch adopted plans');
    marker('Unable to fetch plan');
    marker('Unable to adopt plan, try again later');
    marker('Unable to leave plan, try again later');
    marker('Unable to create plan, try again later');
    marker('Unable to update plan, try again later');
    marker('Unable to delete plan, try again later');
    marker('Unable to fetch posts');
    marker('Unable to fetch post');
    marker('Unable to create post, try again later');
    marker('Unable to update post, try again later');
    marker('Unable to delete post, try again later');
    marker('Unable to fetch release');
    marker('Unable to create release, try again later');
    marker('Unable to update release, try again later');
    marker('Unable to delete release, try again later');
    marker('Unable to fetch user likes');
    marker('Unable to fetch stream');
    marker('Unable to fetch weight chart');
    marker('Unable to fetch userbiodatas');
    marker('Unable to fetch last body composition');
    marker('Unable to fetch last userbiodata');
    marker('Unable to fetch userbiodata');
    marker('Unable to create userbiodata, try again later');
    marker('Unable to update userbiodata, try again later');
    marker('Unable to delete userbiodata, try again later');
    marker('Unable to fetch available chart data');
    marker('Unable to fetch values for chart');
    marker('Unable to fetch values for chart distance/months');
    marker('Unable to fetch workouts');
    marker('Unable to fetch last workout position');
    marker('Unable to fetch last workout group');
    marker('Unable to fetch last workout');
    marker('Unable to fetch workout');
    marker('Unable to create workout, try again later');
    marker('Unable to update workout, try again later');
    marker('Unable to delete workout, try again later');
    marker('Unable to update account, try again later');
    marker('Unable to like, try again later');
    marker('Unable to save comment, try again later');
    marker('Unable to update: Exercise in use on other users\' resources');
    marker('Unable to delete: Exercise in use on other resources');
    marker('Unable to fetch exercises: no exercises on specified page');
    marker('Unable to fetch exercises');
    marker('Unable to fetch features');
    marker(`Unable to upload specified file, size exceeds maximum allowed`)
    marker('Unable to load image');
    marker('Unable to fetch leaderboard positions: no leaderboard positions on specified page');
    marker('Unable to fetch leaderboard positions');
    marker('Unable to fetch measurements: no measurements on specified page');
    marker('Unable to fetch measurements');
    marker('Unable to fetch plans');
    marker('Unable to fetch followers');
    marker('Unable to fetch following');
    marker('Unable to save release');
    marker('Unable to fetch releases');
    marker('Unable to change password');
    marker('Unable to fetch skills');
    marker('Unable to fetch users');
    marker('Can\'t start tracking: Unable to detect location device');
    marker('Unable to obtain position: Permission denied');
    marker('Unable to obtain position: Position unavailable');
    marker('Unable to obtain position: Timeout');
    
    marker('Instructions to reset your password were sent to your e-mail account');
    marker('Password changed successfully');
    marker('Workout saved successfully');

    marker('Please fill all required fields and try again');

    marker('Body composition');
    marker('Fat');
    marker('Muscle');
    marker('Water');
    marker('Other');
    marker("Your account was found in violation of our terms and has been deactivated. If you think this was by mistake, please contact our support.");

    
    marker('Open');
    marker('Closed');
    marker('Resolved');

    marker('Unable to fetch reports');
    marker('Unable to fetch report');
    marker('Unable to create report, try again later');
    marker('You don\'t have permission to update this report');
    marker('Unable to update report, try again later');
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
