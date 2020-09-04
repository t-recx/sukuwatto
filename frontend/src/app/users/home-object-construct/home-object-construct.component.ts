import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-home-object-construct',
  templateUrl: './home-object-construct.component.html',
  styleUrls: ['./home-object-construct.component.css']
})
export class HomeObjectConstructComponent implements OnInit {
  @Input() username: string;
  @Input() object_type: string;
  @Input() display_name: string;
  @Input() object_id: string;

  constructor() { }

  ngOnInit() {
  }

}
