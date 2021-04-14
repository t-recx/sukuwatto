import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FooterComponent } from '../footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@NgModule({
  declarations: [
    FooterComponent,
    LanguageSelectorComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    FontAwesomeModule,
  ],
  exports: [
    FooterComponent,
    LanguageSelectorComponent,
    FontAwesomeModule,
    TranslateModule
  ]
})
export class SharedModule { }
