import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CordovaService {
  paused = new Subject();
  resumed = new Subject();

  constructor() { 
    if (document) {
      document.addEventListener('pause', () => this.paused.next(), false);
      document.addEventListener('resume', () => this.resumed.next(), false);
    }
  }
}
