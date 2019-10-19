import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuardedRoutingModule } from './guarded-routing.module';
import { HomeComponent } from './home/home.component';
import { GuardedComponent } from './guarded/guarded.component';
import { WorkoutComponent } from './workout/workout.component';
import { ProfileComponent } from './profile/profile.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@NgModule({
  declarations: [HomeComponent, GuardedComponent, WorkoutComponent, ProfileComponent],
  imports: [
    CommonModule,
    GuardedRoutingModule,
    FontAwesomeModule,
  ]
})
export class GuardedModule { }
