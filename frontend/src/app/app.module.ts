import { RecaptchaModule, RecaptchaSettings, RECAPTCHA_SETTINGS } from 'ng-recaptcha';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { UsersModule } from './users/users.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
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
import { ContactUsComponent } from './contact-us/contact-us.component';
import { NavbarIndexComponent } from './navbar-index/navbar-index.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

const globalSettings: RecaptchaSettings = { siteKey: environment.recaptchaKey };

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    PageNotFoundComponent,
    TermsAndConditionsComponent,
    ResetPasswordComponent,
    ResetPasswordRequestComponent,
    CookiePolicyComponent,
    MenuLegalComponent,
    PrivacyPolicyComponent,
    AutofocusDirective,
    MainLogoComponent,
    ContactUsComponent,
    NavbarIndexComponent,
  ],
  imports: [
    AlertModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    UsersModule,
    SharedModule,
    RecaptchaModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [
     {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: globalSettings,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
