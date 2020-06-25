import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  menuDropDownVisible: boolean = false;
  faBars = faBars;
  faTimes = faTimes;

  constructor(
    public authService: AuthService, 
    private router: Router,
    public route: ActivatedRoute, 
    ) { }

  ngOnInit() {
  }

  toggleMenuVisibility(): void {
    this.menuDropDownVisible = !this.menuDropDownVisible;
  }
}
