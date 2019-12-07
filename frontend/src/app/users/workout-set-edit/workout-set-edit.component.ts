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
  @Input() visible: boolean;
  @Output() closed = new EventEmitter();
  repetitionType = RepetitionType;
  repetitionTypeLabel = RepetitionTypeLabel;

  constructor(private authService: AuthService) { }

  ngOnInit() {
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
    this.visible = false;
    this.closed.emit();
  }

  remove(): void {
    const index = this.sets.indexOf(this.workoutActivity, 0);
    if (index > -1) {
      this.sets.splice(index, 1);
    }
  }
}
