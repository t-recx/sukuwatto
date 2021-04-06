import { Component, Input, OnInit } from '@angular/core';
import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-demo-navigation',
  templateUrl: './demo-navigation.component.html',
  styleUrls: ['./demo-navigation.component.css']
})
export class DemoNavigationComponent implements OnInit {
  @Input() previousUrl: string;
  @Input() previousFragment: string;
  @Input() nextUrl: string;
  @Input() nextFragment: string;
  @Input() previousText: string;
  @Input() nextText: string;

  arrowLeft = faArrowCircleLeft;
  arrowRight = faArrowCircleRight;

  constructor() { }

  ngOnInit(): void {
  }

}
