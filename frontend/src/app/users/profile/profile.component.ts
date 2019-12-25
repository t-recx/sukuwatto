import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/user';
import { UserService } from 'src/app/user.service';
import { environment } from 'src/environments/environment';
import { faBirthdayCake, faMapMarkerAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: User;
  username: string;
  profileImageURL: string;
  birthDate: Date;

  faUserCircle = faUserCircle;
  faBirthdayCake = faBirthdayCake;
  faMapMarkerAlt = faMapMarkerAlt;

  constructor(
    private route: ActivatedRoute, 
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.profileImageURL = null;
    this.birthDate = null;
    this.username = this.route.snapshot.paramMap.get('username');

    if (this.username) {
      this.userService.get(this.username).subscribe(users => {
        if (users && users.length == 1) {
          this.user = users[0];

          if (this.user.profile_filename) {
            this.profileImageURL = `${environment.mediaUrl}${this.user.profile_filename}`;
          }

          this.birthDate = new Date(this.user.year_birth, this.user.month_birth-1);
        }
      });
    }
  }

}
