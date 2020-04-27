import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { faBars } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  menuDropDownVisible: boolean = false;
  faBars = faBars;

  constructor(
    public authService: AuthService, 
    private router: Router,
    public route: ActivatedRoute, 
    ) { }

  ngOnInit() {
  }

  signOut(): void {
    this.authService.logout();
    
    this.router.navigateByUrl('/');
  }

  toggleMenuVisibility(): void {
    this.menuDropDownVisible = !this.menuDropDownVisible;
  }
}
