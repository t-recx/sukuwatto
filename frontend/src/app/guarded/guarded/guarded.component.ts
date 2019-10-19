import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Router } from '@angular/router';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-guarded',
  templateUrl: './guarded.component.html',
  styleUrls: ['./guarded.component.css']
})
export class GuardedComponent implements OnInit {
  faSignOutAlt = faSignOutAlt;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  signOut(): void {
    this.authService.logout();
    
    this.router.navigateByUrl('/');
  }
}
