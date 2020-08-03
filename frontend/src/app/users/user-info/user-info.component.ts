import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { faUserCircle, faSignOutAlt, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
  showAuthButtons: boolean = environment.showAuthButtons;

  faUserCircle = faUserCircle;
  faUserPlus = faUserPlus;
  faSignInAlt = faSignInAlt;
  faSignOutAlt = faSignOutAlt;

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit() {
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
