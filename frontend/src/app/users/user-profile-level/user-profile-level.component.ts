import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { User } from 'src/app/user';
import { UserService } from 'src/app/user.service';
import { environment } from 'src/environments/environment';
import { LevelService } from '../level.service';
import { UserSkillsService } from '../user-skills.service';
import { WorkoutsService } from '../workouts.service';

@Component({
  selector: 'app-user-profile-level',
  templateUrl: './user-profile-level.component.html',
  styleUrls: ['./user-profile-level.component.css']
})
export class UserProfileLevelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() username: string;
  @Input() simplified: boolean = false;
  
  faUserCircle = faUserCircle;

  user: User;
  profileImageURL: string = null;
  imageHidden: boolean = false;
  nextLevelExperience: number = 0;
  experienceBarWidthUser = 0;
  loading: boolean;

  workoutCreatedSubscription: Subscription;
  workoutUpdatedSubscription: Subscription;
  workoutDeletedSubscription: Subscription;

  userUpdatedSubscription: Subscription;

  constructor(
    private userService: UserService,
    private levelService: LevelService,
    private workoutService: WorkoutsService,
    ) { }

  ngOnInit(): void {
    this.workoutCreatedSubscription = this.workoutService.workoutCreated.subscribe(() => {
      this.loadUser();
    });

    this.workoutUpdatedSubscription = this.workoutService.workoutUpdated.subscribe(() => {
      this.loadUser();
    });

    this.workoutDeletedSubscription = this.workoutService.workoutDeleted.subscribe(() => {
      this.loadUser();
    });

    this.userUpdatedSubscription = this.userService.userUpdated.subscribe(user => {
      this.updateUserInfo(user);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadUser();
  }

  ngOnDestroy(): void {
    this.workoutCreatedSubscription.unsubscribe();
    this.workoutUpdatedSubscription.unsubscribe();
    this.workoutDeletedSubscription.unsubscribe();
    this.userUpdatedSubscription.unsubscribe();
  }

  loadUser() {
    if (this.username) {
      this.loading = true;
      this.userService
      .getUser(this.username)
      .subscribe(user => {
        this.updateUserInfo(user);
      });
    }
    else {
      this.clearUser();
    }
  }

  private updateUserInfo(user: User) {
    if (user) {
      this.user = user;
      this.nextLevelExperience = this.levelService.getLevelExperience(user.level + 1);
      this.experienceBarWidthUser = this.levelService.getExperienceBarWidth(user);
      if (this.user.profile_filename) {
        this.profileImageURL = `${environment.mediaUrl}${this.user.profile_filename}`;
        this.imageHidden = false;
      }
      this.loading = false;
    }
    else {
      this.clearUser();
    }
  }

  private clearUser() {
    this.user = null;
    this.profileImageURL = null;
    this.imageHidden = false;
    this.nextLevelExperience = 0;
  }

  hideImage() {
    this.imageHidden = true;
  }
}
