import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  counter: number = 0;
  underLoad: boolean = false;
  state = new Subject<boolean>();

  constructor() { }

  load() {
    this.counter++;

    if (this.counter > 0 && !this.underLoad) {
      this.underLoad = true;
      this.state.next(this.underLoad);
    }
  }

  unload() {
    this.counter--;

    if (this.counter <= 0 && this.underLoad) {
      this.underLoad = false;
      this.state.next(this.underLoad);
    }
  }

  reset() {
    if (this.underLoad) {
      this.counter = 0;
      this.underLoad = false;
      this.state.next(false);
    }
  }
}
