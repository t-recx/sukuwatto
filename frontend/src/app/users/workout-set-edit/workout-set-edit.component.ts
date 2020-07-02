import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WorkoutSet } from '../workout-set';
import { ExerciseType } from '../exercise';
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
  @Output() cloneOrders = new EventEmitter();

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
  clonePositions: boolean = false;

  constructor(
    private unitsService: UnitsService,
    private authService: AuthService) { }

  ngOnInit() {
    this.triedToHide= false;
    this.cloningModalVisible = false;
    this.number_of_cloned_activities = 1;

    this.loadUnits();
  }

  toggleClonePositions() {
    this.clonePositions = !this.clonePositions;
  }

  loadUnits() {
    this.unitsService.getUnits().subscribe(u => {
      let unitSystem = this.authService.getUserUnitSystem();

      this.units = u.filter(u => u.measurement_type == MeasurementType.Weight);

      if ((!this.workoutActivity.weight_unit || !this.workoutActivity.plan_weight_unit) && unitSystem) {
        let filteredUnits = this.units.filter(u => u.system == unitSystem && u.measurement_type == MeasurementType.Weight);

        if (filteredUnits && filteredUnits.length > 0) {
          if (!this.workoutActivity.weight_unit) {
            this.workoutActivity.weight_unit = filteredUnits[0].id;
          }
          if (!this.workoutActivity.plan_weight_unit) {
            this.workoutActivity.plan_weight_unit = filteredUnits[0].id;
          }
        }
      }

      this.distance_units = u.filter(u => u.measurement_type == MeasurementType.Distance);

      if ((!this.workoutActivity.distance_unit || !this.workoutActivity.plan_distance_unit) && unitSystem) {
        let filteredUnits = this.distance_units.filter(u => u.system == unitSystem && u.measurement_type == MeasurementType.Distance);

        if (filteredUnits && filteredUnits.length > 0) {
          if (!this.workoutActivity.distance_unit) {
            this.workoutActivity.distance_unit = filteredUnits[0].id;
          }
          if (!this.workoutActivity.plan_distance_unit) {
            this.workoutActivity.plan_distance_unit = filteredUnits[0].id;
          }
        }
      }

      this.time_units = u.filter(u => u.measurement_type == MeasurementType.Time);

      if ((!this.workoutActivity.time_unit || !this.workoutActivity.plan_time_unit) && unitSystem) {
        let filteredUnits = this.time_units.filter(u => u.measurement_type == MeasurementType.Time);

        if (filteredUnits && filteredUnits.length > 0) {
          if (!this.workoutActivity.time_unit) {
            this.workoutActivity.time_unit = filteredUnits[0].id;
          }
          if (!this.workoutActivity.plan_time_unit) {
            this.workoutActivity.plan_time_unit = filteredUnits[0].id;
          }
        }
      }

      this.speed_units = u.filter(u => u.measurement_type == MeasurementType.Speed);

      if ((!this.workoutActivity.speed_unit || !this.workoutActivity.plan_speed_unit) && unitSystem) {
        let filteredUnits = this.speed_units.filter(u => u.system == unitSystem && u.measurement_type == MeasurementType.Speed);

        if (filteredUnits && filteredUnits.length > 0) {
          if (!this.workoutActivity.speed_unit) {
            this.workoutActivity.speed_unit = filteredUnits[0].id;
          }
          if (!this.workoutActivity.plan_speed_unit) {
            this.workoutActivity.plan_speed_unit = filteredUnits[0].id;
          }
        }
      }
    });
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
    if (!this.workoutActivity.exercise ||
      !this.workoutActivity.exercise.id) {
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

  close() {
    if (!this.workoutActivity.exercise || !this.workoutActivity.exercise.id || this.workoutActivity.exercise.id == 0) {
      this.remove();
    }
    
    this.hide();
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
      this.cloneOrders.emit({ numberOfActivities: this.number_of_cloned_activities, clonePositions: this.clonePositions});
    }
  }
}
