import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WorkoutSet } from '../workout-set';
import { Exercise } from '../exercise';
import { Unit, MeasurementType } from '../unit';
import { RepetitionType, RepetitionTypeLabel } from '../plan-session-group-activity';
import { AuthService } from 'src/app/auth.service';
import { UnitsService } from '../units.service';

@Component({
  selector: 'app-workout-set-edit',
  templateUrl: './workout-set-edit.component.html',
  styleUrls: ['./workout-set-edit.component.css']
})
export class WorkoutSetEditComponent implements OnInit {
  @Input() sets: WorkoutSet[];
  @Input() workoutActivity: WorkoutSet;
  @Input() triedToSave: boolean;
  @Input() triedToHide: boolean;
  @Input() visible: boolean;
  @Output() closed = new EventEmitter();
  @Output() cloneOrders = new EventEmitter()

  units: Unit[];

  repetitionType = RepetitionType;
  repetitionTypeLabel = RepetitionTypeLabel;

  cloningModalVisible: boolean = false;
  number_of_cloned_activities: number = 1;

  constructor(
    private unitsService: UnitsService,
    private authService: AuthService) { }

  ngOnInit() {
    this.triedToHide= false;
    this.cloningModalVisible = false;
    this.number_of_cloned_activities = 1;

    this.loadUnits();
  }

  loadUnits() {
    this.unitsService.getUnits().subscribe(u => {
      this.units = u.filter(u => u.measurement_type == MeasurementType.Weight);

      let unitSystem = this.authService.getUserUnitSystem();
      if (!this.workoutActivity.unit && unitSystem) {
        let filteredUnits = this.units.filter(u => u.system == unitSystem && u.measurement_type == MeasurementType.Weight);

        if (filteredUnits && filteredUnits.length > 0) {
          this.workoutActivity.unit = filteredUnits[0].id;
        }
      }
    });
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

  hide(): boolean {
    this.triedToHide = true;

    if (!this.valid()) {
      return false;
    }

    this.visible = false;
    this.triedToHide = false;
    this.closed.emit();

    return true;
  }

  valid(): boolean {
    if (!this.workoutActivity.exercise) {
      return false;
    }
    // if (!this.workoutActivity.weight) {
    //   return false;
    // }
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

  showCloningModal(): void {
    this.cloningModalVisible = true;
  }

  hideCloningModal(): void {
    this.cloningModalVisible = false;
  }

  hideAndIssueCloningOrder(): void {
    this.cloningModalVisible = false;

    if (this.hide()) {
      this.cloneOrders.emit(this.number_of_cloned_activities);
    }
  }
}
