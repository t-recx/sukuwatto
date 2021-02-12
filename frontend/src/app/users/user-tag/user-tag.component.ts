import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-tag',
  templateUrl: './user-tag.component.html',
  styleUrls: ['./user-tag.component.css']
})
export class UserTagComponent implements OnInit, OnDestroy {
  @Input() profile_filename: string;
  @Input() username: string;
  @Input() fetchProfileFilename: boolean;

  imageHidden = false;
  faUserCircle = faUserCircle;

  userUpdatedSubscription: Subscription;

  constructor(
    private userService: UserService,
  ) { }

  ngOnDestroy(): void {
    this.userUpdatedSubscription.unsubscribe();
  }

  ngOnInit() {
    if (this.fetchProfileFilename) {
      this.userService.getProfileFilename(this.username)
      .subscribe(f => 
        {
          this.profile_filename = f;
        });
    }

    this.userUpdatedSubscription = this.userService.userUpdated.subscribe(user => {
      if (user.username == this.username) {
        this.profile_filename = user.profile_filename;
      }
    });
  }

  getProfileImageURL(): string {
    if (!this.profile_filename) {
      return null;
    }

    return environment.mediaUrl + this.profile_filename;
  }

  hideImage(): void {
      this.imageHidden = true;
  }
}
