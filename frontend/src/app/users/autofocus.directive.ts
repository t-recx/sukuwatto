import { Directive, AfterViewInit, ElementRef } from '@angular/core';

@Directive({
  selector: '[applyFocus]'
})
export class AutofocusDirective implements AfterViewInit {
  constructor(private el: ElementRef)
  {
  }

  ngAfterViewInit()
  {
    let ua = navigator.userAgent;
    let isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(ua);

    if (!isMobile) {
      window.setTimeout(() => {
        this.el.nativeElement.focus();
      });
    }
  }
}
