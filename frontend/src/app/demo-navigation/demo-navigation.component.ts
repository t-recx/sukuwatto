import { Component, OnInit, Input } from '@angular/core';
import { faArrowCircleRight, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-demo-navigation',
  templateUrl: './demo-navigation.component.html',
  styleUrls: ['./demo-navigation.component.css']
})
export class DemoNavigationComponent implements OnInit {
  @Input() previousUrl: string;
  @Input() nextUrl: string;
  @Input() previousText: string;
  @Input() nextText: string;

  arrowLeft = faArrowCircleLeft;
  arrowRight = faArrowCircleRight;

  constructor() { }

  ngOnInit(): void {
  }

}
