import { Component, OnInit, Input } from '@angular/core';
import { ObjectConstruct } from '../object-construct';

@Component({
  selector: 'app-home-object-construct',
  templateUrl: './home-object-construct.component.html',
  styleUrls: ['./home-object-construct.component.css']
})
export class HomeObjectConstructComponent implements OnInit {
  @Input() username: string;
  @Input() object: ObjectConstruct;
  @Input() object_id: string;

  constructor() { }

  ngOnInit() {
  }

}
