import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { IndexComponent } from './index/index.component';
import { LandingGuard } from './guards/landing.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: IndexComponent, canActivate: [LandingGuard] }, 
  { path: 'login', component: LoginComponent, canActivate: [LandingGuard] }, 
  { path: 'signup', component: SignupComponent, canActivate: [LandingGuard] }, 
  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then(mod => mod.UsersModule),
    canActivate: []
  },
  { path: '**', component: PageNotFoundComponent }
];

export const routingConfiguration: ExtraOptions = {
  paramsInheritanceStrategy: 'always'
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routingConfiguration)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
