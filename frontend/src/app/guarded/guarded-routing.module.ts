import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GuardedComponent } from './guarded/guarded.component';
import { AuthGuard } from '../guards/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { WorkoutComponent } from './workout/workout.component';

const routes: Routes = [
  { 
    path: '', 
    component: GuardedComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [AuthGuard],
        component: HomeComponent,
      },
      {
        path: 'home',
        canActivateChild: [AuthGuard],
        component: HomeComponent,
      },
      {
        path: 'workout',
        canActivateChild: [AuthGuard],
        component: WorkoutComponent,
      },
      {
        path: 'profile',
        canActivateChild: [AuthGuard],
        component: ProfileComponent,
      },
    ]
  }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuardedRoutingModule { }
