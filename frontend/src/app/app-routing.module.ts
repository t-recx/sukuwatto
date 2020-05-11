import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { IndexComponent } from './index/index.component';
import { LandingGuard } from './guards/landing.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AuthGuard } from './guards/auth.guard';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { ResetPasswordRequestComponent } from './reset-password-request/reset-password-request.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

const routes: Routes = [
  { path: '', component: IndexComponent, canActivate: [LandingGuard] }, 
  { path: 'login', component: LoginComponent, canActivate: [LandingGuard] }, 
  { path: 'signup', component: SignupComponent, canActivate: [LandingGuard] }, 
  { path: 'reset-password-request', component: ResetPasswordRequestComponent, canActivate: [LandingGuard] }, 
  { path: 'reset-password/:token', component: ResetPasswordComponent, canActivate: [LandingGuard] }, 
  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then(mod => mod.UsersModule),
    canActivate: []
  },
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
  { path: 'cookie-policy', component: CookiePolicyComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: '**', component: PageNotFoundComponent }
];

export const routingConfiguration: ExtraOptions = {
  paramsInheritanceStrategy: 'always',
  scrollPositionRestoration: 'enabled'
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routingConfiguration)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
