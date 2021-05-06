import { Component, OnInit, Input } from '@angular/core';
import { Action } from '../action';
import { Paginated } from '../paginated';
import { AuthService } from 'src/app/auth.service';
import { environment } from 'src/environments/environment';

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

  environment = environment;
  username: string;

  constructor(
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.username = this.authService.getUsername();
  }

}
