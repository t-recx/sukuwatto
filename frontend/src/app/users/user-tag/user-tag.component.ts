import { Component, OnInit, Input } from '@angular/core';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-user-tag',
  templateUrl: './user-tag.component.html',
  styleUrls: ['./user-tag.component.css']
})
export class UserTagComponent implements OnInit {
  @Input() profile_filename: string;
  @Input() username: string;
  @Input() fetchProfileFilename: boolean;

  faUserCircle = faUserCircle;

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {
    if (this.fetchProfileFilename) {
      this.userService.getProfileFilename(this.username)
      .subscribe(f => 
        {
          console.log(f);
          this.profile_filename = f;
        });
    }
  }

  getProfileImageURL(): string {
    if (!this.profile_filename) {
      return null;
    }

    return `${environment.mediaUrl}${this.profile_filename}`;
  }
}
