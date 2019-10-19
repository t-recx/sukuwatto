import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
    path: 'user',
    loadChildren: () => import('./guarded/guarded.module').then(mod => mod.GuardedModule),
    canActivate: [AuthGuard]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
