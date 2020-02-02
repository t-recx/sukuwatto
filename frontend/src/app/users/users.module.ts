import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';

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
import { WorkoutDetailComponent } from './workout-detail/workout-detail.component';
import { WorkoutSetComponent } from './workout-set/workout-set.component';
import { PlanProgressionStrategyComponent } from './plan-progression-strategy/plan-progression-strategy.component';
import { PlanProgressionStrategiesComponent } from './plan-progression-strategies/plan-progression-strategies.component';
import { WorkoutGroupComponent } from './workout-group/workout-group.component';
import { WorkingWeightsComponent } from './working-weights/working-weights.component';
import { WorkingWeightComponent } from './working-weight/working-weight.component';
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

@NgModule({
  declarations: [HomeComponent, UsersComponent, ProfileComponent, UserInfoComponent, MenuComponent, PlansComponent, PlanDetailComponent, PlanSessionComponent, PlanSessionGroupComponent, PlanSessionGroupExerciseComponent, ExercisesComponent, ExerciseDetailComponent, WorkoutsComponent, WorkoutDetailComponent, WorkoutSetComponent, PlanProgressionStrategyComponent, PlanProgressionStrategiesComponent, WorkoutGroupComponent, WorkingWeightsComponent, WorkingWeightComponent, WorkoutSetEditComponent, WorkoutSetRepetitionsEditComponent, WorkoutTimerComponent, PaginationComponent, UserBioDataDetailComponent, AccountComponent, ImageUploadComponent, UsersFollowListComponent, MessagesComponent, MessageDetailComponent, TimeAgoPipe, UserTagComponent, UserLinkComponent, HomeObjectConstructComponent, PostDetailCardComponent, WorkoutOverviewCardComponent, PostDetailComponent, CardSocialInteractionComponent],
  imports: [
    AlertModule,
    CommonModule,
    UsersRoutingModule,
    FontAwesomeModule,
    DataTablesModule,
    FormsModule,
  ]
})
export class UsersModule { }
