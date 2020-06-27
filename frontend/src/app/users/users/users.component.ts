import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  menuDropDownVisible: boolean = false;
  faBars = faBars;
  faTimes = faTimes;
  loading = false;

  constructor(
    public authService: AuthService, 
    private router: Router,
    public route: ActivatedRoute, 
    loadingService: LoadingService,
    ) { 
      loadingService.state.subscribe(s => this.loading = s);
    }

  ngOnInit() {
  }

  toggleMenuVisibility(): void {
    this.menuDropDownVisible = !this.menuDropDownVisible;
  }
}
