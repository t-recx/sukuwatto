import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  constructor(
    private authService: AuthService, 
    private router: Router,
    public route: ActivatedRoute, 
    ) { }

  ngOnInit() {
  }

  signOut(): void {
    this.authService.logout();
    
    this.router.navigateByUrl('/');
  }
}
