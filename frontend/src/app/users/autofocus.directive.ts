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
    window.setTimeout(() => {
      this.el.nativeElement.focus();
    });
  }
}
