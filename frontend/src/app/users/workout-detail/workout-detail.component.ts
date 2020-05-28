import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workout-detail',
  templateUrl: './workout-detail.component.html',
  styleUrls: ['./workout-detail.component.css']
})
export class WorkoutDetailComponent implements OnInit {

  id: number;
  username: string;
  allowEdit: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => 
      {
        this.allowEdit = false;
        this.username = params.get('username');
        this.id = +params.get('id');

        if (this.authService.isLoggedIn()) {
          if (this.username == this.authService.getUsername()) {
            this.allowEdit = true;
          }
        }
      });
  }
}
