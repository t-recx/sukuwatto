import { Component, OnInit, Input } from '@angular/core';
import { Action } from '../action';
import { Paginated } from '../paginated';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  @Input() actions: Action[];
  @Input() paginated: Paginated<Action>;
  @Input() loadingNewActions = false;
  @Input() loadingOlderActions = false;

  constructor() { }

  ngOnInit() {
  }

}
