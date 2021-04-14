import { Component, OnDestroy, OnInit } from '@angular/core';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { LanguageService } from '../language.service';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {

  languagePopupVisible = false;
  currentLanguage = 'English';

  faGlobe = faGlobe;

  sub : Subscription;

  constructor(
    private languageService : LanguageService,
  ) { 
    this.sub = languageService.languageChanged.subscribe(language => this.updateLabel());
  }

  ngOnInit(): void {
    this.updateLabel();
  }

  private updateLabel() {
    this.currentLanguage = this.languageService.getLanguageName();
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  toggleLanguagePopup() {
    this.languagePopupVisible = !this.languagePopupVisible;
  }

  changeLanguage(language) {
    this.languageService.changeLanguage(language);

    this.toggleLanguagePopup();
  }


}
