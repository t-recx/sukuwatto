import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.css']
})
export class ShareComponent implements OnInit {
  nextUrl = '/signup';

  constructor() { 
    if (!environment.showAuthButtons) {
      this.nextUrl = null;
    }
  }

  ngOnInit(): void {
  }

}
