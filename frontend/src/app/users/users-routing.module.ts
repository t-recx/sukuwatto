import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UsersComponent } from './users/users.component';
import { ProfileComponent } from './profile/profile.component';
import { PlanDetailComponent } from './plan-detail/plan-detail.component';
import { ExercisesComponent } from './exercises/exercises.component';
import { ExerciseDetailComponent } from './exercise-detail/exercise-detail.component';
import { WorkoutsComponent } from './workouts/workouts.component';
import { WorkoutDetailEditComponent } from './workout-detail-edit/workout-detail-edit.component';
import { AccountComponent } from './account/account.component';
import { MessagesComponent } from './messages/messages.component';
import { MessageDetailComponent } from './message-detail/message-detail.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { HomeGuard } from '../guards/home.guard';
import { WorkoutDetailComponent } from './workout-detail/workout-detail.component';
import { AuthGuard } from '../guards/auth.guard';
import { QuickActivityComponent } from './quick-activity/quick-activity.component';
import { MeasurementDetailComponent } from './measurement-detail/measurement-detail.component';
import { MeasurementsComponent } from './measurements/measurements.component';
import { PublicPlansComponent } from './public-plans/public-plans.component';
import { AdoptedPlansComponent } from './adopted-plans/adopted-plans.component';
import { OwnedPlansComponent } from './owned-plans/owned-plans.component';
import { UsersSearchComponent } from './users-search/users-search.component';
import { ProfileFollowersComponent } from './profile-followers/profile-followers.component';
import { ProfileFollowingComponent } from './profile-following/profile-following.component';
import { ProfileRequestsComponent } from './profile-requests/profile-requests.component';
import { UserSkillsComponent } from './user-skills/user-skills.component';
import { LeaderboardListComponent } from './leaderboard-list/leaderboard-list.component';
import { ReportsComponent } from './reports/reports.component';
import { ReportDetailComponent } from './report-detail/report-detail.component';
import { ReportsOpenComponent } from './reports-open/reports-open.component';
import { ReportsClosedComponent } from './reports-closed/reports-closed.component';
import { ReportsResolvedComponent } from './reports-resolved/reports-resolved.component';

const routes: Routes = [
  { 
    path: ':username', 
    component: UsersComponent,
    canActivate: [],
    children: [
      {
        path: '',
        canActivate: [HomeGuard],
        component: HomeComponent,
      },
      {
        path: 'home',
        canActivate: [HomeGuard],
        component: HomeComponent,
      },
      {
        path: 'profile',
        canActivateChild: [],
        component: ProfileComponent,
      },
      {
        path: 'followers',
        canActivateChild: [],
        component: ProfileFollowersComponent,
      },
      {
        path: 'following',
        canActivateChild: [],
        component: ProfileFollowingComponent,
      },
      {
        path: 'skills',
        canActivateChild: [],
        component: UserSkillsComponent,
      },
      {
        path: 'requests',
        canActivateChild: [],
        component: ProfileRequestsComponent,
      },
      {
        path: 'post/:id',
        canActivateChild: [],
        component: PostDetailComponent,
      },
      {
        path: 'plans/:page',
        canActivateChild: [],
        component: PublicPlansComponent,
      },
      {
        path: 'plans',
        canActivateChild: [],
        component: PublicPlansComponent,
      },
      {
        path: 'adopted-plans/:page',
        canActivateChild: [],
        component: AdoptedPlansComponent,
      },
      {
        path: 'adopted-plans',
        canActivateChild: [],
        component: AdoptedPlansComponent,
      },
      {
        path: 'owned-plans/:page',
        canActivateChild: [],
        component: OwnedPlansComponent,
      },
      {
        path: 'owned-plans',
        canActivateChild: [],
        component: OwnedPlansComponent,
      },
      {
        path: 'plan/:id',
        canActivateChild: [],
        component: PlanDetailComponent,
      },
      {
        path: 'plan',
        canActivate: [AuthGuard],
        component: PlanDetailComponent,
      },
      {
        path: 'messages',
        canActivate: [AuthGuard],
        component: MessagesComponent,
      },
      {
        path: 'message/:correspondent',
        canActivate: [AuthGuard],
        component: MessageDetailComponent,
      },
      {
        path: 'search-users/:page',
        canActivateChild: [AuthGuard],
        component: UsersSearchComponent,
      },
      {
        path: 'search-users',
        canActivateChild: [AuthGuard],
        component: UsersSearchComponent,
      },
      {
        path: 'workouts/:page',
        canActivateChild: [],
        component: WorkoutsComponent,
      },
      {
        path: 'workouts',
        canActivateChild: [],
        component: WorkoutsComponent,
      },
      {
        path: 'workout/:id',
        canActivateChild: [],
        component: WorkoutDetailComponent,
      },
      {
        path: 'workout',
        canActivate: [AuthGuard],
        component: WorkoutDetailEditComponent,
      },
      {
        path: 'quick-activity',
        canActivate: [AuthGuard],
        component: QuickActivityComponent,
      },
      {
        path: 'exercises',
        canActivateChild: [],
        component: ExercisesComponent,
      },
      {
        path: 'exercises/:page',
        canActivateChild: [],
        component: ExercisesComponent,
      },
      {
        path: 'exercise/:id',
        canActivateChild: [],
        component: ExerciseDetailComponent,
      },
      {
        path: 'exercise',
        canActivate: [AuthGuard],
        component: ExerciseDetailComponent,
      },
      {
        path: 'measurements',
        canActivateChild: [],
        component: MeasurementsComponent,
      },
      {
        path: 'measurements/:page',
        canActivateChild: [],
        component: MeasurementsComponent,
      },
      {
        path: 'measurement/:id',
        canActivateChild: [],
        component: MeasurementDetailComponent,
      },
      {
        path: 'measurement',
        canActivate: [AuthGuard],
        component: MeasurementDetailComponent,
      },
      {
        path: 'leaderboards',
        canActivateChild: [],
        component: LeaderboardListComponent,
      },
      {
        path: 'leaderboards/:page',
        canActivateChild: [],
        component: LeaderboardListComponent,
      },
      {
        path: 'account',
        canActivate: [AuthGuard],
        component: AccountComponent,
      },
      {
        path: 'reports/:page',
        canActivateChild: [AuthGuard],
        component: ReportsOpenComponent,
      },
      {
        path: 'reports',
        canActivateChild: [AuthGuard],
        component: ReportsOpenComponent,
      },
      {
        path: 'closed-reports/:page',
        canActivateChild: [AuthGuard],
        component: ReportsClosedComponent,
      },
      {
        path: 'closed-reports',
        canActivateChild: [AuthGuard],
        component: ReportsClosedComponent,
      },
      {
        path: 'resolved-reports/:page',
        canActivateChild: [AuthGuard],
        component: ReportsResolvedComponent,
      },
      {
        path: 'resolved-reports',
        canActivateChild: [AuthGuard],
        component: ReportsResolvedComponent,
      },
      {
        path: 'report/:id',
        canActivateChild: [AuthGuard],
        component: ReportDetailComponent,
      },
    ]
  }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
