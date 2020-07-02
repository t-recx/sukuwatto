import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeService {

  constructor() { }

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
