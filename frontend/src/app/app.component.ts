import { Component, Renderer2, AfterViewInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'sukuwatto';

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    if (environment.application) {
      // if we're on mobile then I'm displaying a loader element that I'll remove 
      // after the view initialized
      let loader = this.renderer.selectRootElement('#loader');
      this.renderer.setStyle(loader, 'display', 'none');
    }
  }
}
