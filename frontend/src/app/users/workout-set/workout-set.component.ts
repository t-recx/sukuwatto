import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() statusChanged = new EventEmitter();

  faCheck = faCheck;
  faEdit = faEdit;
  faTimesCircle = faTimesCircle;
  editing: boolean = false;
  editingRepetitions: boolean = false;
  repetitionType = RepetitionType;

  constructor() { }

  ngOnInit() {
    if (!this.workoutActivity.exercise.id) {
      this.editing = true;
    }
  }

  toggleEdit(event) {
    this.editing = !this.editing;
    event.stopPropagation();
  }

  toggleEditRepetitions(event) {
    this.editingRepetitions = !this.editingRepetitions;
    event.stopPropagation();
  }

  toggleDone(): void {
    if (!this.editing) {
      if (this.workoutActivity.done == null) {
        this.workoutActivity.done = false;
      }

      this.workoutActivity.done = !this.workoutActivity.done;

      if (this.workoutActivity.done) {
        this.workoutActivity.in_progress = false;
        this.workoutActivity.end = new Date();
      }
      else {
        this.workoutActivity.in_progress = false;
        this.workoutActivity.start = null;
        this.workoutActivity.end = null;
      }

      if (this.workoutActivity.done && !this.workoutActivity.number_of_repetitions) {
        if (this.workoutActivity.repetition_type == RepetitionType.Standard) {
          this.workoutActivity.expected_number_of_repetitions;
        }
        else if (this.workoutActivity.repetition_type == RepetitionType.Range) {
          this.editingRepetitions = true;
        }
        else if (this.workoutActivity.repetition_type != RepetitionType.None) {
          this.editingRepetitions = true;
        }
      }

      this.statusChanged.emit();
    }
  }

  onWorkingSetEditClosed(): void {
    this.editing = false;
  }

  onWorkingSetEditRepetitionsClosed(): void {
    this.editingRepetitions = false;
  }
}
