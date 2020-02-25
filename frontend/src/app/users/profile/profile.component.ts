import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { User } from 'src/app/user';
import { UserService } from 'src/app/user.service';
import { environment } from 'src/environments/environment';
import { faBirthdayCake, faMapMarkerAlt, faUserCircle, faAt, faEnvelope, faUserPlus, faUserMinus } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth.service';
import { FollowService } from '../follow.service';
import { ContentTypesService } from '../content-types.service';
import { MessagesService } from '../messages.service';

export enum UserViewProfileTab {
  Followers = 1,
  Following = 2,
}

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

  profileTab = UserViewProfileTab;
  selectedTab: UserViewProfileTab;

  canFollow: boolean;
  canMessage: boolean;
  isFollowed: boolean;

  followers: User[];

  userContentTypeID: number;

  faAt = faAt;
  faEnvelope = faEnvelope;
  faUserPlus = faUserPlus;
  faUserMinus = faUserMinus;
  faUserCircle = faUserCircle;
  faBirthdayCake = faBirthdayCake;
  faMapMarkerAlt = faMapMarkerAlt;

  messageModalVisible: boolean;

  following: User[];
  showUnfollowButtonOnFollowingList: boolean;

  constructor(
    private route: ActivatedRoute, 
    private userService: UserService,
    private authService: AuthService,
    private followService: FollowService,
    private contentTypesService: ContentTypesService,
    private messagesService: MessagesService,
  ) { }

  ngOnInit() {
    this.contentTypesService.get("customuser").subscribe(x => {
      if (x.length > 0) {
        this.userContentTypeID = x[0].id;
      }
    });

    this.route.paramMap.subscribe(params =>
      this.loadUserData(params.get('username')));
  }

  private loadUserData(username: string) {
    this.selectedTab = UserViewProfileTab.Followers;
    this.user = null;
    this.profileImageURL = null;
    this.birthDate = null;
    this.messageModalVisible = false;
    this.username = username;
    this.followService.getCanFollow(this.username).subscribe(x => this.canFollow = x);
    this.messagesService.getCanMessage(this.username).subscribe(x => this.canMessage = x);
    this.loadFollowers();
    this.loadFollowing();
    if (this.username) {
      this.userService.get(this.username).subscribe(users => {
        if (users && users.length == 1) {
          this.user = users[0];
          if (this.user.profile_filename) {
            this.profileImageURL = `${environment.mediaUrl}${this.user.profile_filename}`;
          }
          this.birthDate = new Date(this.user.year_birth, this.user.month_birth - 1);
        }
      });
    }

    this.showUnfollowButtonOnFollowingList = this.authService.isLoggedIn() && 
      this.username == this.authService.getUsername();
  }

  loadFollowers(): void {
    this.followService.getFollowers(this.username).subscribe(followers => 
      {
        this.followers = followers;
        this.isFollowed = followers.filter(user => user.username == this.authService.getUsername()).length > 0;
      });
  }

  loadFollowing(): void {
    this.followService.getFollowing(this.username).subscribe(following => 
      {
        this.following = following;
      });
  }

  showMessageModal(): void {
    this.messageModalVisible = true;
  }

  follow(): void {
    this.followService.follow(this.userContentTypeID, this.user.id).subscribe(x => this.loadFollowers());
  }

  unfollow(): void {
    this.followService.unfollow(this.userContentTypeID, this.user.id).subscribe(x => this.loadFollowing());
  }

  public unfollowUser(user: User): void {
    console.log('b');
    this.followService.unfollow(this.userContentTypeID, user.id).subscribe(x => this.loadFollowing());
  }

  selectTab(tab: UserViewProfileTab): void {
    this.selectedTab = tab;
  }
}
