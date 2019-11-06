import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
  faUserCircle = faUserCircle;
  faSignOutAlt = faSignOutAlt;

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit() {
  }

}
