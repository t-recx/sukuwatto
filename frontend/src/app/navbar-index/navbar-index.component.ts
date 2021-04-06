import { Component, OnInit } from '@angular/core';
import { faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar-index',
  templateUrl: './navbar-index.component.html',
  styleUrls: ['./navbar-index.component.css']
})
export class NavbarIndexComponent implements OnInit {
  faSignInAlt = faSignInAlt;
  faUserPlus = faUserPlus;

  constructor() { }

  ngOnInit(): void {
  }

}
