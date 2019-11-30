import { Component, OnInit, Input } from '@angular/core';
import { WorkoutSet } from '../workout-set';
import { Exercise } from '../exercise';
import { RepetitionType, RepetitionTypeLabel } from '../plan-session-group-activity';
import { faCheck, faEdit, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Unit } from '../unit';

@Component({
  selector: 'app-workout-set',
  templateUrl: './workout-set.component.html',
  styleUrls: ['./workout-set.component.css']
})
export class WorkoutSetComponent implements OnInit {
  @Input() sets: WorkoutSet[];
  @Input() workoutActivity: WorkoutSet;
  @Input() triedToSave: boolean;
  @Input() exercises: Exercise[];
  @Input() units: Unit[];

  repetitionType = RepetitionType;
  faCheck = faCheck;
  faEdit = faEdit;
  faTimesCircle = faTimesCircle;
  editing: boolean = false;
  editingRepetitions: boolean = false;
  repetitionTypeLabel = RepetitionTypeLabel;

  constructor() { }

  ngOnInit() {
    if (!this.workoutActivity.exercise) {
      this.editing = true;
    }
  }

  toggleEdit() {
    this.editing = !this.editing;
  }

  toggleEditRepetitions() {
    this.editingRepetitions = !this.editingRepetitions;
  }

  repetitionTypeChange() {
    if (this.workoutActivity.repetition_type != RepetitionType.Range) {
      this.workoutActivity.expected_number_of_repetitions_up_to = null;
    }

    if (this.workoutActivity.repetition_type != RepetitionType.Range &&
      this.workoutActivity.repetition_type != RepetitionType.Standard) {
      this.workoutActivity.expected_number_of_repetitions = null;
      this.workoutActivity.expected_number_of_repetitions_up_to = null;
    }
  }

  toggleDone(): void {
    if (!this.editing) {
      if (this.workoutActivity.done == null) {
        this.workoutActivity.done = true;
      }
      else {
        this.workoutActivity.done = !this.workoutActivity.done;
      }
    }
  }

  remove(): void {
    const index = this.sets.indexOf(this.workoutActivity, 0);
    if (index > -1) {
      this.sets.splice(index, 1);
    }
  }
}
