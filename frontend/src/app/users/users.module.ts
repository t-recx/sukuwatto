import { NgModule, Pipe } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { UsersRoutingModule } from './users-routing.module';
import { HomeComponent } from './home/home.component';
import { UsersComponent } from './users/users.component';
import { ProfileComponent } from './profile/profile.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { MenuComponent } from './menu/menu.component';
import { PlansComponent } from './plans/plans.component';
import { AlertModule } from '../alert/alert.module';
import { PlanDetailComponent } from './plan-detail/plan-detail.component';
import { FormsModule } from '@angular/forms';
import { PlanSessionComponent } from './plan-session/plan-session.component';
import { PlanSessionGroupComponent } from './plan-session-group/plan-session-group.component';
import { PlanSessionGroupExerciseComponent } from './plan-session-group-activity/plan-session-group-activity.component';
import { ExercisesComponent } from './exercises/exercises.component';
import { ExerciseDetailComponent } from './exercise-detail/exercise-detail.component';
import { WorkoutsComponent } from './workouts/workouts.component';
import { WorkoutDetailEditComponent } from './workout-detail-edit/workout-detail-edit.component';
import { WorkoutSetComponent } from './workout-set/workout-set.component';
import { PlanProgressionStrategyComponent } from './plan-progression-strategy/plan-progression-strategy.component';
import { PlanProgressionStrategiesComponent } from './plan-progression-strategies/plan-progression-strategies.component';
import { WorkoutGroupComponent } from './workout-group/workout-group.component';
import { WorkingParametersComponent } from './working-parameters/working-parameters.component';
import { WorkingParameterComponent } from './working-parameter/working-parameter.component';
import { WorkoutSetEditComponent } from './workout-set-edit/workout-set-edit.component';
import { WorkoutSetRepetitionsEditComponent } from './workout-set-repetitions-edit/workout-set-repetitions-edit.component';
import { WorkoutTimerComponent } from './workout-timer/workout-timer.component';
import { PaginationComponent } from './pagination/pagination.component';
import { UserBioDataDetailComponent } from './user-bio-data-detail/user-bio-data-detail.component';
import { AccountComponent } from './account/account.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { UsersFollowListComponent } from './users-follow-list/users-follow-list.component';
import { MessagesComponent } from './messages/messages.component';
import { MessageDetailComponent } from './message-detail/message-detail.component';
import { UserTagComponent } from './user-tag/user-tag.component';
import { UserLinkComponent } from './user-link/user-link.component';
import { HomeObjectConstructComponent } from './home-object-construct/home-object-construct.component';
import { PostDetailCardComponent } from './post-detail-card/post-detail-card.component';
import { WorkoutOverviewCardComponent } from './workout-overview-card/workout-overview-card.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { CardSocialInteractionComponent } from './card-social-interaction/card-social-interaction.component';
import { CommentCardComponent } from './comment-card/comment-card.component';
import { EditDeleteDropdownComponent } from './edit-delete-dropdown/edit-delete-dropdown.component';
import { DeleteModalComponent } from './delete-modal/delete-modal.component';
import { FeedComponent } from './feed/feed.component';
import { ExercisesListComponent } from './exercises-list/exercises-list.component';
import { ExercisesModalComponent } from './exercises-modal/exercises-modal.component';
import { ExercisesInputComponent } from './exercises-input/exercises-input.component';
import { ExerciseDetailSkeletonComponent } from './exercise-detail-skeleton/exercise-detail-skeleton.component';
import { ExerciseDetailModalComponent } from './exercise-detail-modal/exercise-detail-modal.component';
import { UnitConvertPipe } from './unit-convert.pipe';
import { PlanCardComponent } from './plan-card/plan-card.component';
import { UserChangePasswordComponent } from './user-change-password-modal/user-change-password-modal.component';
import { UserProgressChartComponent } from './user-progress-chart/user-progress-chart.component';
import { UserProgressChartsComponent } from './user-progress-charts/user-progress-charts.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { WorkoutFinishWorkoutModalComponent } from './workout-finish-workout-modal/workout-finish-workout-modal.component';
import { UserFinishWorkoutProgressChartComponent } from './user-finish-workout-progress-chart/user-finish-workout-progress-chart.component';
import { WorkoutDetailComponent } from './workout-detail/workout-detail.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { ExerciseCardComponent } from './exercise-card/exercise-card.component';
import { ExerciseCardDescriptionComponent } from './exercise-card-description/exercise-card-description.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { AutofocusDirective } from './autofocus.directive';
import { WorkoutSetGeolocationComponent } from './workout-set-geolocation/workout-set-geolocation.component';
import { WorkoutGroupTabContentComponent } from './workout-group-tab-content/workout-group-tab-content.component';
import { WorkoutFinishStatsComponent } from './workout-finish-stats/workout-finish-stats.component';
import { QuickActivityComponent } from './quick-activity/quick-activity.component';
import { SharedModule } from '../shared/shared.module';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { PostImagesUploadComponent } from './post-images-upload/post-images-upload.component';
import { RefreshIconComponent } from './refresh-icon/refresh-icon.component';
import { MeasurementsComponent } from './measurements/measurements.component';
import { MeasurementDetailComponent } from './measurement-detail/measurement-detail.component';
import { UserBioDataSkeletonComponent } from './user-bio-data-skeleton/user-bio-data-skeleton.component';
import { MeasurementCardComponent } from './measurement-card/measurement-card.component';
import { AdoptedPlansComponent } from './adopted-plans/adopted-plans.component';
import { OwnedPlansComponent } from './owned-plans/owned-plans.component';
import { PublicPlansComponent } from './public-plans/public-plans.component';
import { UsersSearchComponent } from './users-search/users-search.component';
import { WorkoutSetGeolocationViewerComponent } from './workout-set-geolocation-viewer/workout-set-geolocation-viewer.component';
import { ExerciseMuscleComponent } from './exercise-muscle/exercise-muscle.component';
import { HumanReadablePipe } from './human-readable.pipe';
import { LocaleStringPipe } from './locale-string.pipe';
import { LocaleDateStringPipe } from './locale-date-string.pipe';
import { LocaleTimeStringPipe } from './locale-time-string.pipe';
import { ProfileFollowersComponent } from './profile-followers/profile-followers.component';
import { ProfileFollowingComponent } from './profile-following/profile-following.component';
import { ProfileRequestsComponent } from './profile-requests/profile-requests.component';
import { UserSkillsComponent } from './user-skills/user-skills.component';
import { UserProfileLevelComponent } from './user-profile-level/user-profile-level.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { LeaderboardListComponent } from './leaderboard-list/leaderboard-list.component';
import { LeaderboardItemComponent } from './leaderboard-item/leaderboard-item.component';
import { TimeAgoPipe } from './time-ago.pipe';
import { ReportModalComponent } from './report-modal/report-modal.component';
import { ReportsComponent } from './reports/reports.component';
import { ReportDetailComponent } from './report-detail/report-detail.component';
import { ReportCardComponent } from './report-card/report-card.component';
import { ReportsOpenComponent } from './reports-open/reports-open.component';
import { ReportsClosedComponent } from './reports-closed/reports-closed.component';
import { ReportsResolvedComponent } from './reports-resolved/reports-resolved.component';

@NgModule({
  declarations: [HomeComponent, UsersComponent, ProfileComponent, UserInfoComponent, MenuComponent, PlansComponent, PlanDetailComponent, PlanSessionComponent, PlanSessionGroupComponent, PlanSessionGroupExerciseComponent, ExercisesComponent, ExerciseDetailComponent, WorkoutsComponent, WorkoutDetailEditComponent, WorkoutSetComponent, PlanProgressionStrategyComponent, PlanProgressionStrategiesComponent, WorkoutGroupComponent, WorkingParametersComponent, WorkingParameterComponent, WorkoutSetEditComponent, WorkoutSetRepetitionsEditComponent, WorkoutTimerComponent, PaginationComponent, UserBioDataDetailComponent, AccountComponent, ImageUploadComponent, UsersFollowListComponent, MessagesComponent, MessageDetailComponent, UserTagComponent, UserLinkComponent, HomeObjectConstructComponent, PostDetailCardComponent, WorkoutOverviewCardComponent, PostDetailComponent, CardSocialInteractionComponent, CommentCardComponent, EditDeleteDropdownComponent, DeleteModalComponent, FeedComponent, ExercisesListComponent, ExercisesModalComponent, ExercisesInputComponent, ExerciseDetailSkeletonComponent, ExerciseDetailModalComponent, UnitConvertPipe, PlanCardComponent, UserChangePasswordComponent, UserProgressChartComponent, UserProgressChartsComponent, PieChartComponent, WorkoutFinishWorkoutModalComponent, UserFinishWorkoutProgressChartComponent, WorkoutDetailComponent, LoadingSpinnerComponent, ExerciseCardComponent, ExerciseCardDescriptionComponent, PageNotFoundComponent, ForbiddenComponent, AutofocusDirective, WorkoutSetGeolocationComponent, WorkoutGroupTabContentComponent, WorkoutFinishStatsComponent, QuickActivityComponent, SnackbarComponent, PostImagesUploadComponent, RefreshIconComponent, MeasurementsComponent, MeasurementDetailComponent, UserBioDataSkeletonComponent, MeasurementCardComponent, AdoptedPlansComponent, OwnedPlansComponent, PublicPlansComponent, UsersSearchComponent, WorkoutSetGeolocationViewerComponent, ExerciseMuscleComponent, HumanReadablePipe, LocaleStringPipe, LocaleDateStringPipe, LocaleTimeStringPipe, ProfileFollowersComponent, ProfileFollowingComponent, ProfileRequestsComponent, UserSkillsComponent, UserProfileLevelComponent, LeaderboardComponent, LeaderboardListComponent, LeaderboardItemComponent, TimeAgoPipe, ReportModalComponent, ReportsComponent, ReportDetailComponent, ReportCardComponent, ReportsOpenComponent, ReportsClosedComponent, ReportsResolvedComponent],
  imports: [
    AlertModule,
    SharedModule,
    CommonModule,
    UsersRoutingModule,
    FormsModule,
    LeafletModule,
    ImageCropperModule
  ]
})
export class UsersModule { }
