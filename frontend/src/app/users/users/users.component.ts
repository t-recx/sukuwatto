import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from '../loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  menuDropDownVisible: boolean = false;
  faBars = faBars;
  faTimes = faTimes;
  loading = false;
  loadingSubscription: Subscription;

  constructor(
    public authService: AuthService, 
    private router: Router,
    public route: ActivatedRoute, 
    loadingService: LoadingService,
    ) { 
      this.loadingSubscription = loadingService.state.subscribe(s => this.loading = s);
    }

  ngOnDestroy(): void {
    this.loadingSubscription.unsubscribe();
  }

  ngOnInit() {
  }

  toggleMenuVisibility(): void {
    this.menuDropDownVisible = !this.menuDropDownVisible;
  }
}
