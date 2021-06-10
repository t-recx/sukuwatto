import { Component, OnDestroy, OnInit } from '@angular/core';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { LanguageService } from '../language.service';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit, OnDestroy {

  faDownload = faDownload;
  language: string;
  languageChangedSubscription: Subscription;

  constructor(languageService: LanguageService) {
    this.language = languageService.getLanguage();
    this.languageChangedSubscription = languageService.languageChanged.subscribe(language => {
      this.language = language;
    });
   }

  ngOnDestroy(): void {
    this.languageChangedSubscription.unsubscribe();
  }

  ngOnInit(): void {
  }

}
