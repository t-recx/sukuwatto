import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { IndexComponent } from './index/index.component';
import { UsersModule } from './users/users.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertModule } from './alert/alert.module';
import { TokenInterceptor } from './token.interceptor';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ResetPasswordRequestComponent } from './reset-password-request/reset-password-request.component';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import { MenuLegalComponent } from './menu-legal/menu-legal.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { AutofocusDirective } from './autofocus.directive';
import { MainLogoComponent } from './main-logo/main-logo.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SharedModule } from './shared/shared.module';
import { TrackComponent } from './track/track.component';
import { PlanComponent } from './plan/plan.component';
import { ShareComponent } from './share/share.component';
import { JumbotronComponent } from './jumbotron/jumbotron.component';
import { DemoNavigationComponent } from './demo-navigation/demo-navigation.component';
import { ContactUsComponent } from './contact-us/contact-us.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    IndexComponent,
    PageNotFoundComponent,
    TermsAndConditionsComponent,
    ResetPasswordComponent,
    ResetPasswordRequestComponent,
    CookiePolicyComponent,
    MenuLegalComponent,
    PrivacyPolicyComponent,
    AutofocusDirective,
    MainLogoComponent,
    TrackComponent,
    PlanComponent,
    ShareComponent,
    JumbotronComponent,
    DemoNavigationComponent,
    ContactUsComponent,
  ],
  imports: [
    AlertModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    UsersModule,
    SharedModule,
    FontAwesomeModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [
     {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
