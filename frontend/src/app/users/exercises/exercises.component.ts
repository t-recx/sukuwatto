import { Component, OnInit, OnDestroy } from '@angular/core';
import { Exercise, SectionLabel, ForceLabel, MechanicsLabel, ModalityLabel } from '../exercise';
import { ExercisesService } from '../exercises.service';
import { Subject } from 'rxjs';
import 'datatables.net';
import { AuthService } from 'src/app/auth.service';
import { Router } from '@angular/router';
import { faDumbbell } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.css']
})
export class ExercisesComponent implements OnInit {
  faDumbbell = faDumbbell;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  navigate(exercise) {
    this.router.navigate(['/users', this.authService.getUsername(), 'exercise', exercise.id]);
  }
}
