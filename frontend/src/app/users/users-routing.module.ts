import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UsersComponent } from './users/users.component';
import { ProfileComponent } from './profile/profile.component';
import { PlansComponent } from './plans/plans.component';
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
        path: 'post/:id',
        canActivateChild: [],
        component: PostDetailComponent,
      },
      {
        path: 'plans',
        canActivateChild: [],
        component: PlansComponent,
      },
      {
        path: 'plan/:id',
        canActivateChild: [],
        component: PlanDetailComponent,
      },
      {
        path: 'plan',
        canActivateChild: [],
        component: PlanDetailComponent,
      },
      {
        path: 'messages',
        canActivateChild: [],
        component: MessagesComponent,
      },
      {
        path: 'message/:correspondent',
        canActivateChild: [],
        component: MessageDetailComponent,
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
        canActivateChild: [],
        component: WorkoutDetailEditComponent,
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
        canActivateChild: [],
        component: ExerciseDetailComponent,
      },
      {
        path: 'account',
        canActivateChild: [],
        component: AccountComponent,
      },
    ]
  }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
