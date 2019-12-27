import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/user';
import { UserService } from 'src/app/user.service';
import { environment } from 'src/environments/environment';
import { faBirthdayCake, faMapMarkerAlt, faUserCircle, faAt, faEnvelope, faUserPlus, faUserMinus } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth.service';

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

  canFollow: boolean;
  canUnfollow: boolean;
  canMessage: boolean;

  faAt = faAt;
  faEnvelope = faEnvelope;
  faUserPlus = faUserPlus;
  faUserMinus = faUserMinus;
  faUserCircle = faUserCircle;
  faBirthdayCake = faBirthdayCake;
  faMapMarkerAlt = faMapMarkerAlt;

  messageModalVisible: boolean;
  unfollowModalVisible: boolean;
  followModalVisible: boolean;

  constructor(
    private route: ActivatedRoute, 
    private userService: UserService,
    private authService: AuthService,
  ) { }

  getCanFollow(username: string): boolean {
return true;

    if (!this.authService.isLoggedIn()) {
      return false;
    }

    if (this.authService.getUsername() == username) {
      return false;
    }

    // todo: return true if user currently not followed

    // todo: check specific follow permissions when created
    // like, maybe, the user can disable the possibility of following

    return true;
  }

  getCanUnfollow(username: string): boolean {
return false;
    if (!this.authService.isLoggedIn()) {
      return false;
    }

    if (this.authService.getUsername() == username) {
      return false;
    }

    // todo: return true if user followed

    return true;
  }

  getCanMessage(username: string): boolean {
    return true;
    if (!this.authService.isLoggedIn()) {
      return false;
    }

    if (this.authService.getUsername() == username) {
      return false;
    }

    // todo: check specific message permissions, when created

    return true;
  }

  ngOnInit() {
    this.profileImageURL = null;
    this.birthDate = null;
    this.messageModalVisible= false;
    this.unfollowModalVisible= false;
    this.followModalVisible= false;
    this.username = this.route.snapshot.paramMap.get('username');
    this.canFollow = this.getCanFollow(this.username);
    this.canMessage = this.getCanMessage(this.username);

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

  showFollowModal(): void {
    this.followModalVisible = true;
  }

  showUnfollowModal(): void {
    this.unfollowModalVisible = true;
  }

  showMessageModal(): void {
    this.messageModalVisible = true;
  }

}
