import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-link',
  templateUrl: './user-link.component.html',
  styleUrls: ['./user-link.component.css']
})
export class UserLinkComponent implements OnInit {
  @Input() username: string;

  constructor() { }

  ngOnInit() {
  }

}
