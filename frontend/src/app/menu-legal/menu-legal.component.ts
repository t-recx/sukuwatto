import { Component, OnInit } from '@angular/core';
import { faBalanceScale, faCookie, faEnvelope, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-menu-legal',
  templateUrl: './menu-legal.component.html',
  styleUrls: ['./menu-legal.component.css']
})
export class MenuLegalComponent implements OnInit {

  faBalanceScale = faBalanceScale;
  faCookie = faCookie;
  faEnvelope = faEnvelope;
  faShieldAlt = faShieldAlt;

  constructor() { }

  ngOnInit(): void {
  }

}
