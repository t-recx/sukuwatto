import { Component, OnInit, Input } from '@angular/core';
import { WorkoutSet } from '../workout-set';
import { Exercise } from '../exercise';
import { RepetitionType, RepetitionTypeLabel } from '../plan-session-group-activity';
import { faCheck, faEdit } from '@fortawesome/free-solid-svg-icons';
import { WorkoutGroup } from '../workout-group';

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

  exercise: Exercise;
  repetitionType = RepetitionType;
  faCheck = faCheck;
  faEdit = faEdit;
  editing: boolean = false;
  editingRepetitions: boolean = false;
  repetitionTypeLabel = RepetitionTypeLabel;

  constructor() { }

  ngOnInit() {
    this.exercise = this.exercises.filter(x => x.id == this.workoutActivity.exercise)[0];
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

  remove(): void {
    const index = this.sets.indexOf(this.workoutActivity, 0);
    if (index > -1) {
      this.sets.splice(index, 1);
    }
  }
}
