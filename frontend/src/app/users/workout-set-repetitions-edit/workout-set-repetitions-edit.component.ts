import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WorkoutSet } from '../workout-set';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-workout-set-repetitions-edit',
  templateUrl: './workout-set-repetitions-edit.component.html',
  styleUrls: ['./workout-set-repetitions-edit.component.css']
})
export class WorkoutSetRepetitionsEditComponent implements OnInit {
  @Input() workoutActivity: WorkoutSet;
  @Input() triedToSave: boolean;
  @Input() visible: boolean;
  @Output() closed = new EventEmitter();

  faCheck = faCheck;

  constructor() { }

  ngOnInit() {
    if (!this.workoutActivity.number_of_repetitions) {
      if (this.workoutActivity.expected_number_of_repetitions_up_to) {
        this.workoutActivity.number_of_repetitions = this.workoutActivity.expected_number_of_repetitions_up_to;
      }
      else if (this.workoutActivity.expected_number_of_repetitions) {
        this.workoutActivity.number_of_repetitions = this.workoutActivity.expected_number_of_repetitions;
      }
    }
  }

  hide(): void {
    this.visible = false;
    this.closed.emit();
  }
}
