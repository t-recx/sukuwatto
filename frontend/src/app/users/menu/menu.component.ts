import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { faAddressCard, faTasks, faDumbbell, faCalendarAlt, faComments, faHome } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  iconHome = faHome;
  iconProfile = faAddressCard;
  iconMessages = faComments;
  iconWorkouts = faTasks;
  iconExercises = faDumbbell;
  iconPlans = faCalendarAlt;

  constructor(
    public authService: AuthService, 
  ) { }

  ngOnInit() {
  }

}
