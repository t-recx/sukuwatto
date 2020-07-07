import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SerializerUtilsService {

  constructor() { }

  serializeScrollPosition() {
    localStorage.setItem('state_window_pageYOffset', window.pageYOffset.toString());
  }

  restoreScrollPosition() {
    const pageYOffset = localStorage.getItem('state_window_pageYOffset');

    if (pageYOffset && pageYOffset.length > 0) {
      window.scrollBy(0, +pageYOffset);
    }
  }

  removeScrollPosition() {
    localStorage.removeItem('state_window_pageYOffset');
  }
}
