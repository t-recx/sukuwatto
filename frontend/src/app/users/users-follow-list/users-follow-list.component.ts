import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { User } from 'src/app/user';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-users-follow-list',
  templateUrl: './users-follow-list.component.html',
  styleUrls: ['./users-follow-list.component.css']
})
export class UsersFollowListComponent implements OnInit {
  @Input() users: User[];
  @Input() actionText: string;
  @Input() showActionButton: boolean;
  @Input() actionIcon;
  @Output() actionPressed = new EventEmitter<User>();

  faUserCircle = faUserCircle;

  constructor() { }

  ngOnInit() {
  }

  action(user: User): void {
    this.actionPressed.emit(user);
  }

  getProfileImageURL(user: User): string {
    if (!user.profile_filename) {
      return null;
    }

    return `${environment.mediaUrl}${user.profile_filename}`;
  }
}
