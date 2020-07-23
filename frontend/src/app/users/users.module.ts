import { NgModule, Pipe } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { UsersRoutingModule } from './users-routing.module';
import { HomeComponent } from './home/home.component';
import { UsersComponent } from './users/users.component';
import { ProfileComponent } from './profile/profile.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
import { TimeAgoPipe } from 'time-ago-pipe';
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

@Pipe({
    name: 'timeAgo',
    pure: false
})
export class TimeAgoExtendsPipe extends TimeAgoPipe {}

@NgModule({
  declarations: [HomeComponent, UsersComponent, ProfileComponent, UserInfoComponent, MenuComponent, PlansComponent, PlanDetailComponent, PlanSessionComponent, PlanSessionGroupComponent, PlanSessionGroupExerciseComponent, ExercisesComponent, ExerciseDetailComponent, WorkoutsComponent, WorkoutDetailEditComponent, WorkoutSetComponent, PlanProgressionStrategyComponent, PlanProgressionStrategiesComponent, WorkoutGroupComponent, WorkingParametersComponent, WorkingParameterComponent, WorkoutSetEditComponent, WorkoutSetRepetitionsEditComponent, WorkoutTimerComponent, PaginationComponent, UserBioDataDetailComponent, AccountComponent, ImageUploadComponent, UsersFollowListComponent, MessagesComponent, MessageDetailComponent, TimeAgoExtendsPipe, UserTagComponent, UserLinkComponent, HomeObjectConstructComponent, PostDetailCardComponent, WorkoutOverviewCardComponent, PostDetailComponent, CardSocialInteractionComponent, CommentCardComponent, EditDeleteDropdownComponent, DeleteModalComponent, FeedComponent, ExercisesListComponent, ExercisesModalComponent, ExercisesInputComponent, ExerciseDetailSkeletonComponent, ExerciseDetailModalComponent, UnitConvertPipe, PlanCardComponent, UserChangePasswordComponent, UserProgressChartComponent, UserProgressChartsComponent, PieChartComponent, WorkoutFinishWorkoutModalComponent, UserFinishWorkoutProgressChartComponent, WorkoutDetailComponent, LoadingSpinnerComponent, ExerciseCardComponent, ExerciseCardDescriptionComponent, PageNotFoundComponent, ForbiddenComponent, AutofocusDirective, WorkoutSetGeolocationComponent, WorkoutGroupTabContentComponent, WorkoutFinishStatsComponent, QuickActivityComponent],
  imports: [
    AlertModule,
    SharedModule,
    CommonModule,
    UsersRoutingModule,
    FontAwesomeModule,
    FormsModule,
    LeafletModule,
  ]
})
export class UsersModule { }
