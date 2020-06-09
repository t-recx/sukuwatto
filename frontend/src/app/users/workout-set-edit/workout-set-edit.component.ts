import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WorkoutSet } from '../workout-set';
import { Exercise, ExerciseType } from '../exercise';
import { Unit, MeasurementType } from '../unit';
import { RepetitionType, RepetitionTypeLabel, SpeedType, Vo2MaxType, DistanceType, TimeType, SpeedTypeLabel, Vo2MaxTypeLabel, TimeTypeLabel, DistanceTypeLabel } from '../plan-session-group-activity';
import { AuthService } from 'src/app/auth.service';
import { UnitsService } from '../units.service';
import { faCheck, faTrash, faClone, faTimes } from '@fortawesome/free-solid-svg-icons';

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

  faCheck = faCheck;
  faTrash = faTrash;
  faClone = faClone;
  faTimes = faTimes;

  units: Unit[];
  speed_units: Unit[];
  time_units: Unit[];
  distance_units: Unit[];

  repetitionType = RepetitionType;
  repetitionTypeLabel = RepetitionTypeLabel;

  speedType = SpeedType;
  timeType = TimeType;
  distanceType = DistanceType;
  vo2MaxType = Vo2MaxType;

  speedTypeLabel = SpeedTypeLabel;
  vo2MaxTypeLabel = Vo2MaxTypeLabel;
  timeTypeLabel = TimeTypeLabel;
  distanceTypeLabel = DistanceTypeLabel;

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
      let unitSystem = this.authService.getUserUnitSystem();

      this.units = u.filter(u => u.measurement_type == MeasurementType.Weight);

      if (!this.workoutActivity.unit && unitSystem) {
        let filteredUnits = this.units.filter(u => u.system == unitSystem && u.measurement_type == MeasurementType.Weight);

        if (filteredUnits && filteredUnits.length > 0) {
          this.workoutActivity.unit = filteredUnits[0].id;
          this.workoutActivity.unit_code = filteredUnits[0].abbreviation;
        }
      }

      this.distance_units = u.filter(u => u.measurement_type == MeasurementType.Distance);

      if (!this.workoutActivity.distance_unit && unitSystem) {
        let filteredUnits = this.distance_units.filter(u => u.system == unitSystem && u.measurement_type == MeasurementType.Distance);

        if (filteredUnits && filteredUnits.length > 0) {
          this.workoutActivity.distance_unit = filteredUnits[0].id;
          this.workoutActivity.distance_unit_code = filteredUnits[0].abbreviation;
        }
      }

      this.time_units = u.filter(u => u.measurement_type == MeasurementType.Time);

      if (!this.workoutActivity.time_unit && unitSystem) {
        let filteredUnits = this.time_units.filter(u => u.measurement_type == MeasurementType.Time);

        if (filteredUnits && filteredUnits.length > 0) {
          this.workoutActivity.time_unit = filteredUnits[0].id;
          this.workoutActivity.time_unit_code = filteredUnits[0].abbreviation;
        }
      }

      this.speed_units = u.filter(u => u.measurement_type == MeasurementType.Speed);

      if (!this.workoutActivity.speed_unit && unitSystem) {
        let filteredUnits = this.speed_units.filter(u => u.system == unitSystem && u.measurement_type == MeasurementType.Speed);

        if (filteredUnits && filteredUnits.length > 0) {
          this.workoutActivity.speed_unit = filteredUnits[0].id;
          this.workoutActivity.speed_unit_code = filteredUnits[0].abbreviation;
        }
      }
    });
  }

  updateUnitCodes() {
    if (this.workoutActivity.unit) {
      this.workoutActivity.unit_code = this.units.filter(u => u.id == this.workoutActivity.unit)[0].abbreviation;
    }
    else {
      this.workoutActivity.unit_code = null;
    }

    if (this.workoutActivity.speed_unit) {
      this.workoutActivity.speed_unit_code = this.speed_units.filter(u => u.id == this.workoutActivity.speed_unit)[0].abbreviation;
    }
    else {
      this.workoutActivity.speed_unit_code = null;
    }

    if (this.workoutActivity.distance_unit) {
      this.workoutActivity.distance_unit_code = this.distance_units.filter(u => u.id == this.workoutActivity.distance_unit)[0].abbreviation;
    }
    else {
      this.workoutActivity.distance_unit_code = null;
    }

    if (this.workoutActivity.time_unit) {
      this.workoutActivity.time_unit_code = this.time_units.filter(u => u.id == this.workoutActivity.time_unit)[0].abbreviation;
    }
    else {
      this.workoutActivity.time_unit_code = null;
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

  speedTypeChange() {
    if (this.workoutActivity.speed_type != SpeedType.Range) {
      this.workoutActivity.expected_speed_up_to = null;
    }

    if (this.workoutActivity.speed_type != SpeedType.Range &&
      this.workoutActivity.speed_type != SpeedType.Standard) {
      this.workoutActivity.expected_speed = null;
      this.workoutActivity.expected_speed_up_to = null;
    }
  }

  timeTypeChange() {
    if (this.workoutActivity.time_type != TimeType.Range) {
      this.workoutActivity.expected_time_up_to = null;
    }

    if (this.workoutActivity.time_type != TimeType.Range &&
      this.workoutActivity.time_type != TimeType.Standard) {
      this.workoutActivity.expected_time = null;
      this.workoutActivity.expected_time_up_to = null;
    }
  }

  distanceTypeChange() {
    if (this.workoutActivity.distance_type != DistanceType.Range) {
      this.workoutActivity.expected_distance_up_to = null;
    }

    if (this.workoutActivity.distance_type != DistanceType.Range &&
      this.workoutActivity.distance_type != DistanceType.Standard) {
      this.workoutActivity.expected_distance = null;
      this.workoutActivity.expected_distance_up_to = null;
    }
  }

  vo2MaxTypeChange() {
    if (this.workoutActivity.vo2max_type != Vo2MaxType.Range) {
      this.workoutActivity.expected_vo2max_up_to = null;
    }

    if (this.workoutActivity.vo2max_type != Vo2MaxType.Range &&
      this.workoutActivity.vo2max_type != Vo2MaxType.Standard) {
      this.workoutActivity.expected_vo2max = null;
      this.workoutActivity.expected_vo2max_up_to = null;
    }
  }

  hide(): boolean {
    this.triedToHide = true;

    if (!this.valid()) {
      return false;
    }

    this.updateUnitCodes();

    this.visible = false;
    this.triedToHide = false;
    this.closed.emit();

    return true;
  }

  valid(): boolean {
    if (!this.workoutActivity.exercise) {
      return false;
    }

    if (this.workoutActivity.exercise.exercise_type == ExerciseType.Strength) {
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
    }
    else if (this.workoutActivity.exercise.exercise_type == ExerciseType.Cardio) {
      if (this.workoutActivity.speed_type &&
        this.workoutActivity.speed_type != SpeedType.None) {
        if ((this.workoutActivity.speed_type == SpeedType.Standard ||
          this.workoutActivity.speed_type == SpeedType.Range) &&
          !this.workoutActivity.expected_speed) {
          return false;
        }
        if (this.workoutActivity.speed_type == SpeedType.Range &&
          !this.workoutActivity.expected_speed_up_to) {
          return false;
        }
      }

      if (this.workoutActivity.vo2max_type &&
        this.workoutActivity.vo2max_type != Vo2MaxType.None) {
        if ((this.workoutActivity.vo2max_type == Vo2MaxType.Standard ||
          this.workoutActivity.vo2max_type == Vo2MaxType.Range) &&
          !this.workoutActivity.expected_vo2max) {
          return false;
        }
        if (this.workoutActivity.vo2max_type == Vo2MaxType.Range &&
          !this.workoutActivity.expected_vo2max_up_to) {
          return false;
        }
      }

      if (this.workoutActivity.distance_type &&
        this.workoutActivity.distance_type != DistanceType.None) {
        if ((this.workoutActivity.distance_type == DistanceType.Standard ||
          this.workoutActivity.distance_type == DistanceType.Range) &&
          !this.workoutActivity.expected_distance) {
          return false;
        }
        if (this.workoutActivity.distance_type == DistanceType.Range &&
          !this.workoutActivity.expected_distance_up_to) {
          return false;
        }
      }

      if (this.workoutActivity.time_type &&
        this.workoutActivity.time_type != TimeType.None) {
        if ((this.workoutActivity.time_type == TimeType.Standard ||
          this.workoutActivity.time_type == TimeType.Range) &&
          !this.workoutActivity.expected_time) {
          return false;
        }
        if (this.workoutActivity.time_type == TimeType.Range &&
          !this.workoutActivity.expected_time_up_to) {
          return false;
        }
      }
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
