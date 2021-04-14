import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  availableLanguages = ['en', 'pt'];

  languageChanged = new Subject<string>();

  constructor(
    private translate: TranslateService,
  ) { 
  }

  startUp() {
    this.translate.setDefaultLang('en');
    this.changeLanguage(this.getLanguage(), false);
  }

  changeLanguage(language: string, persist = true) {
    if (persist) {
      this.setLanguage(language);
    }

    this.translate.use(language);

    this.languageChanged.next(language);
  }

  public setLanguage(language: string) {
    this.setLocalStorageItem('language', language);
  }

  getLanguageMatchingNavigator() {
    if (navigator && navigator.language && navigator.language.trim().length > 0) {
      let filteredLanguage = this.availableLanguages.filter(x => x == navigator.language)[0];

      if (filteredLanguage) {
        return filteredLanguage;
      }

      filteredLanguage = this.availableLanguages.filter(x => navigator.language.startsWith(x))[0];

      if (filteredLanguage) {
        return filteredLanguage;
      }
    }

    return null;
  }

  public getLanguage() {
    let language = this.getLocalStorageItem('language');

    if (language == null || language.trim().length == 0) {
      language = this.getLanguageMatchingNavigator();

      if (!language) {
        language = 'en';
      }
    }

    return language;
  }

  public getLanguageName() {
    const language = this.getLanguage();

    if (language == 'pt') {
      return 'Português';
    }

    return 'English';
  }

  private getLocalStorageItem(key: string): string {
    return localStorage.getItem(key);
  }

  private setLocalStorageItem(key: string, value: string) {
    if (value) {
      localStorage.setItem(key, value);
    }
    else {
      localStorage.removeItem(key);
    }
  }
}
