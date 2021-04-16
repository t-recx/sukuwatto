import { Pipe, PipeTransform, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../language.service';

@Pipe({
  name: 'timeAgo',
  pure: false
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private timer: number;
  private locale: string = 'en';

  languageChangedSubscription: Subscription;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    languageService: LanguageService) {
      this.locale = languageService.getLanguage();

      this.languageChangedSubscription = languageService.languageChanged.subscribe(language => {
        this.locale = language;
      });
     }

  transform(value: string) {
    this.removeTimer();
    let d = new Date(value);
    let now = new Date();
    let seconds = Math.round(Math.abs((now.getTime() - d.getTime()) / 1000));
    let timeToUpdate = (Number.isNaN(seconds)) ? 1000 : this.getSecondsUntilUpdate(seconds) * 1000;
    this.timer = this.ngZone.runOutsideAngular(() => {
      if (typeof window !== 'undefined') {
        return window.setTimeout(() => {
          this.ngZone.run(() => this.changeDetectorRef.markForCheck());
        }, timeToUpdate);
      }
      return null;
    });
    let minutes = Math.round(Math.abs(seconds / 60));
    let hours = Math.round(Math.abs(minutes / 60));
    let days = Math.round(Math.abs(hours / 24));
    let months = Math.round(Math.abs(days / 30.416));
    let years = Math.round(Math.abs(days / 365));
    if (Number.isNaN(seconds)) {
      return '';
    } else if (seconds <= 45) {
      return this.formatMessage('a_few_seconds_ago', []);
    } else if (seconds <= 90) {
      return this.formatMessage('a_minute_ago', []);
    } else if (minutes <= 45) {
      return this.formatMessage('x_minutes_ago', [minutes]);
    } else if (minutes <= 90) {
      return this.formatMessage('an_hour_ago', []);
    } else if (hours <= 22) {
      return this.formatMessage('x_hours_ago', [hours]);
    } else if (hours <= 36) {
      return this.formatMessage('a_day_ago', []);
    } else if (days <= 25) {
      return this.formatMessage('x_days_ago', [days]);
    } else if (days <= 45) {
      return this.formatMessage('a_month_ago', []);
    } else if (days <= 345) {
      return this.formatMessage('x_months_ago', [months]);
    } else if (days <= 545) {
      return this.formatMessage('a_year_ago', []);
    } else { 
      return this.formatMessage('x_years_ago', [years]);
    }
  }

  private formatMessage(message: string, args: any[]): string {
    let formatted: string = messages[message][this.locale] || messages[message]['en'];

    for (let i = 0; i < args.length; i++) {
      let regexp = new RegExp('\\{' + i + '\\}', 'gi');
      formatted = formatted.replace(regexp, args[i]);
    }

    return formatted;
  }

  ngOnDestroy(): void {
    this.removeTimer();

    if (this.languageChangedSubscription) {
      this.languageChangedSubscription.unsubscribe();
    }
  }

  private removeTimer() {
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private getSecondsUntilUpdate(seconds: number) {
    let min = 60;
    let hr = min * 60;
    let day = hr * 24;
    if (seconds < min) { // less than 1 min, update every 2 secs
      return 2;
    } else if (seconds < hr) { // less than an hour, update every 30 secs
      return 30;
    } else if (seconds < day) { // less then a day, update every 5 mins
      return 300;
    } else { // update every hour
      return 3600;
    }
  }
}

const messages = {
  'a_few_seconds_ago': {
    'en': 'a few seconds ago',
    'pt': 'há alguns segundos'
  },
  'a_minute_ago': {
    'en': 'a minute ago',
    'pt': 'há um minuto'
  },
  'x_minutes_ago': {
    'en': '{0} minutes ago',
    'pt': 'há {0} minutos atrás'
  },
  'an_hour_ago': {
    'en': 'an hour ago',
    'pt': 'há uma hora atrás'
  },
  'x_hours_ago': {
    'en': '{0} hours ago',
    'pt': 'há {0} horas'
  },
  'a_day_ago': {
    'en': 'a day ago',
    'pt': 'há um dia'
  },
  'x_days_ago': {
    'en': '{0} days ago',
    'pt': 'há {0} dias'
  },
  'a_month_ago': {
    'en': 'a month ago',
    'pt': 'há um mês'
  },
  'x_months_ago': {
    'en': '{0} months ago',
    'pt': 'há {0} meses'
  },
  'a_year_ago': {
    'en': 'a year ago',
    'pt': 'há um ano'
  },
  'x_years_ago': {
    'en': '{0} years ago',
    'pt': 'há {0} anos'
  }
};