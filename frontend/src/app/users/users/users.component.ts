import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
export class UsersComponent implements OnInit, OnDestroy, AfterViewInit {
  menuDropDownVisible: boolean = false;
  faBars = faBars;
  faTimes = faTimes;
  loading = false;
  loadingSubscription: Subscription;

  constructor(
    public authService: AuthService, 
    private router: Router,
    public route: ActivatedRoute, 
    private loadingService: LoadingService,
    ) { 
    }

  ngAfterViewInit(): void {
    this.loadingSubscription = this.loadingService.state.subscribe(s => setTimeout(() => this.loading = s));
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
