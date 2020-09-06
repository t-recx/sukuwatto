import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, HostListener } from '@angular/core';
import { User } from 'src/app/user';
import { faUserCircle, faCircleNotch, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Paginated } from '../paginated';

@Component({
  selector: 'app-users-follow-list',
  templateUrl: './users-follow-list.component.html',
  styleUrls: ['./users-follow-list.component.css']
})
export class UsersFollowListComponent implements OnInit {
  @Input() users: User[];
  @Input() loading: boolean;

  @Input() actionText: string;
  @Input() showActionButton: boolean;
  @Input() actionIcon;
  @Output() actionPressed = new EventEmitter<User>();
  @Input() showDeleteButton: boolean;
  @Input() deleteIcon;
  @Output() deletePressed = new EventEmitter<User>();

  constructor(
  ) { }

  ngOnInit() {
  }

  public action(user: User): void {
    this.actionPressed.emit(user);
  }

  public delete(user: User): void {
    this.deletePressed.emit(user);
  }
}
