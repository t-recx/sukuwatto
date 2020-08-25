import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeService {

  constructor() { }

  getTimeOrDateIfNotToday(date): string {
    date = new Date(date);

    if (date.toLocaleDateString() != (new Date()).toLocaleDateString()) {
      return date.toLocaleDateString();
    }

    return this.getTime(date);
  }

  getTime(date): string {
    let localeString = (new Date(date)).toLocaleTimeString();
    let time = localeString.substring(0, 5);

    if (time[time.length - 1] == ':') {
      time = time.substring(0, 4);
    }

    if (localeString.endsWith('AM') || localeString.endsWith('PM')) {
      time += ' ' + localeString.slice(-2);
    }

    return time;
  }

  toHumanReadable(milliseconds: number, showSeconds: boolean = true) {
    const portions: string[] = [];

    const msInHour = 1000 * 60 * 60;
    const hours = Math.trunc(milliseconds / msInHour);
    if (hours > 0) {
      portions.push(hours + 'h');
      milliseconds = milliseconds - (hours * msInHour);
    }

    const msInMinute = 1000 * 60;
    const minutes = Math.trunc(milliseconds / msInMinute);

    if (minutes > 0) {
      portions.push((hours > 0 ? minutes.toString().padStart(2, '0') : minutes) + 'm');
      milliseconds = milliseconds - (minutes * msInMinute);
    }

    if (showSeconds) {
      const seconds = Math.trunc(milliseconds / 1000);
    
      portions.push((minutes > 0 ? seconds.toString().padStart(2, '0') : seconds) + 's');
    }

    return portions.join(' ');
  }
}
