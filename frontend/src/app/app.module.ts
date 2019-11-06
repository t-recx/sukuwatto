import { JwtModule } from '@auth0/angular-jwt';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { IndexComponent } from './index/index.component';
import { UsersModule } from './users/users.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertModule } from './alert/alert.module';

export function tokenGetter() {
  return localStorage.getItem("access_token");
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    IndexComponent,
    PageNotFoundComponent,
  ],
  imports: [
    AlertModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    DataTablesModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ["localhost:8000"],
        skipWhenExpired: true,
        blacklistedRoutes: [""]
      }
    }),
    UsersModule,
    FontAwesomeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
