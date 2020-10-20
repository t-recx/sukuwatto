import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PageSizeService {

  constructor() { }

  getPageSize(actionHeight: number, offset: number = 0) {
    const innerHeight = window.innerHeight;

    const navBarHeight = 294;
    const footerHeight = 0; //187;

    let ps = Math.ceil((innerHeight - navBarHeight - footerHeight) / actionHeight);

    if (ps < 3) {
      ps = 3;
    }

    return ps;
  }

  canScroll() {
    return (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 300;
  }
}
