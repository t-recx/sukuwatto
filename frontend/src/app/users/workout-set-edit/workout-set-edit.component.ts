import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WorkoutSet } from '../workout-set';
import { Exercise } from '../exercise';
import { Unit, MeasurementType } from '../unit';
import { RepetitionType, RepetitionTypeLabel } from '../plan-session-group-activity';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-workout-set-edit',
  templateUrl: './workout-set-edit.component.html',
  styleUrls: ['./workout-set-edit.component.css']
})
export class WorkoutSetEditComponent implements OnInit {
  @Input() sets: WorkoutSet[];
  @Input() workoutActivity: WorkoutSet;
  @Input() exercises: Exercise[];
  @Input() units: Unit[];
  @Input() triedToSave: boolean;
  @Input() triedToHide: boolean;
  @Input() visible: boolean;
  @Output() closed = new EventEmitter();
  repetitionType = RepetitionType;
  repetitionTypeLabel = RepetitionTypeLabel;

  exercise_id: number;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.exercise_id = this.workoutActivity.exercise.id;

    this.triedToHide= false;
    let unitSystem = this.authService.getUserUnitSystem();
    if (!this.workoutActivity.unit && unitSystem) {
      let filteredUnits = this.units.filter(u => u.system == unitSystem && u.measurement_type == MeasurementType.Weight);

      if (filteredUnits && filteredUnits.length > 0) {
        this.workoutActivity.unit = filteredUnits[0].id;
      }
    }
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

  hide(): void {
    this.triedToHide = true;

    if (!this.valid()) {
      return;
    }

    // the cloning here is necessary because we don't want to inadvertently change the original exercises' array
    this.workoutActivity.exercise = {...this.exercises.find(e => e.id == this.exercise_id)};

    this.visible = false;
    this.triedToHide = false;
    this.closed.emit();
  }

  valid(): boolean {
    if (!this.exercise_id) {
      return false;
    }
    if (!this.workoutActivity.weight) {
      return false;
    }
    if (!this.workoutActivity.unit) {
      return false;
    }
    if (!this.workoutActivity.repetition_type) {
      return false;
    }
    if ((this.workoutActivity.repetition_type == RepetitionType.Standard || 
      this.workoutActivity.repetition_type == RepetitionType.Range) &&
      !this.workoutActivity.expected_number_of_repetitions) {
      return false;
    }
    if (this.workoutActivity.repetition_type == RepetitionType.Range &&
      !this.workoutActivity.expected_number_of_repetitions_up_to) {
      return false;
    }

    return true;
  }

  remove(): void {
    const index = this.sets.indexOf(this.workoutActivity, 0);
    if (index > -1) {
      this.sets.splice(index, 1);
    }
  }
}
