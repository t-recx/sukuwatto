import { Component, Input, OnInit } from '@angular/core';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-ad-modal',
  templateUrl: './ad-modal.component.html',
  styleUrls: ['./ad-modal.component.css']
})
export class AdModalComponent implements OnInit {
  @Input() visible: boolean = true;

  faSkipAd = faArrowRight;

  constructor() { }

  ngOnInit(): void {
  }

  close() {
    this.visible = false;
  }

  openAd() {
    window.open('https://www.khanacademy.org/', '_system');
  }
}
