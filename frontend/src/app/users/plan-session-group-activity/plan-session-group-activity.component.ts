import { Component, OnInit, Input } from '@angular/core';
import { PlanSessionGroupActivity, RepetitionTypeLabel, RepetitionType, SpeedType, SpeedTypeLabel, DistanceType, DistanceTypeLabel, TimeType, TimeTypeLabel, Vo2MaxType, Vo2MaxTypeLabel } from '../plan-session-group-activity';
import { Exercise, ExerciseType } from '../exercise';
import { Unit, MeasurementType } from '../unit';
import { UnitsService } from '../units.service';

@Component({
  selector: 'app-plan-session-group-activity',
  templateUrl: './plan-session-group-activity.component.html',
  styleUrls: ['./plan-session-group-activity.component.css']
})
export class PlanSessionGroupExerciseComponent implements OnInit {
  @Input() planSessionGroupExercise: PlanSessionGroupActivity;
  @Input() triedToSave: boolean;

  units: Unit[];
  speedUnits: Unit[];
  timeUnits: Unit[];
  distanceUnits: Unit[];

  repetitionTypeEnum = RepetitionType;
  repetitionTypeLabel = RepetitionTypeLabel;

  speedTypeEnum = SpeedType;
  speedTypeLabel = SpeedTypeLabel;

  distanceTypeEnum = DistanceType;
  distanceTypeLabel = DistanceTypeLabel;

  timeTypeEnum = TimeType;
  timeTypeLabel = TimeTypeLabel;

  vo2MaxTypeEnum = Vo2MaxType;
  vo2MaxTypeLabel = Vo2MaxTypeLabel;

  constructor(
    private unitsService: UnitsService,
  ) { }

  ngOnInit() {
    this.unitsService.getUnits()
    .subscribe(units => {
      this.units = units;
      this.speedUnits = units.filter(u => u.measurement_type == MeasurementType.Speed);
      this.timeUnits = units.filter(u => u.measurement_type == MeasurementType.Time);
      this.distanceUnits = units.filter(u => u.measurement_type == MeasurementType.Distance);
    });
  }

  repetitionTypeChange() {
    if (this.planSessionGroupExercise.repetition_type != RepetitionType.Range) {
      this.planSessionGroupExercise.number_of_repetitions_up_to = null;
    }

    if (this.planSessionGroupExercise.repetition_type != RepetitionType.Range &&
      this.planSessionGroupExercise.repetition_type != RepetitionType.Standard) {
      this.planSessionGroupExercise.number_of_repetitions = null;
      this.planSessionGroupExercise.number_of_repetitions_up_to = null;
    }
  }

  speedTypeChange() {
    if (this.planSessionGroupExercise.speed_type != SpeedType.Range) {
      this.planSessionGroupExercise.speed_up_to = null;
    }

    if (this.planSessionGroupExercise.speed_type != SpeedType.Range &&
      this.planSessionGroupExercise.speed_type != SpeedType.Standard) {
      this.planSessionGroupExercise.speed = null;
      this.planSessionGroupExercise.speed_up_to = null;
    }

    if (this.planSessionGroupExercise.speed_type != SpeedType.Parameter) {
      this.planSessionGroupExercise.working_speed_percentage = null;
    }
  }

  distanceTypeChange() {
    if (this.planSessionGroupExercise.distance_type != DistanceType.Range) {
      this.planSessionGroupExercise.distance_up_to = null;
    }

    if (this.planSessionGroupExercise.distance_type != DistanceType.Range &&
      this.planSessionGroupExercise.distance_type != DistanceType.Standard) {
      this.planSessionGroupExercise.distance = null;
      this.planSessionGroupExercise.distance_up_to = null;
    }

    if (this.planSessionGroupExercise.distance_type != DistanceType.Parameter) {
      this.planSessionGroupExercise.working_distance_percentage = null;
    }
  }

  timeTypeChange() {
    if (this.planSessionGroupExercise.time_type != TimeType.Range) {
      this.planSessionGroupExercise.time_up_to = null;
    }

    if (this.planSessionGroupExercise.time_type != TimeType.Range &&
      this.planSessionGroupExercise.time_type != TimeType.Standard) {
      this.planSessionGroupExercise.time = null;
      this.planSessionGroupExercise.time_up_to = null;
    }

    if (this.planSessionGroupExercise.time_type != TimeType.Parameter) {
      this.planSessionGroupExercise.working_time_percentage = null;
    }
  }
  
  vo2MaxTypeChange() {
    if (this.planSessionGroupExercise.vo2max_type != Vo2MaxType.Range) {
      this.planSessionGroupExercise.vo2max_up_to = null;
    }

    if (this.planSessionGroupExercise.vo2max_type != Vo2MaxType.Range &&
      this.planSessionGroupExercise.vo2max_type != Vo2MaxType.Standard) {
      this.planSessionGroupExercise.vo2max = null;
      this.planSessionGroupExercise.vo2max_up_to = null;
    }
  }

  exerciseChanged() {
    if (this.planSessionGroupExercise.exercise.exercise_type == ExerciseType.Strength) {
      this.planSessionGroupExercise.vo2max = this.planSessionGroupExercise.vo2max_up_to = this.planSessionGroupExercise.vo2max_type =
      this.planSessionGroupExercise.time = this.planSessionGroupExercise.time_type = this.planSessionGroupExercise.time_unit =
      this.planSessionGroupExercise.time_up_to = null;

      this.planSessionGroupExercise.working_distance_percentage = this.planSessionGroupExercise.working_speed_percentage =
      this.planSessionGroupExercise.working_time_percentage = null;

      this.planSessionGroupExercise.speed = this.planSessionGroupExercise.speed_type = this.planSessionGroupExercise.speed_unit = 
      this.planSessionGroupExercise.speed_up_to = null;

      this.planSessionGroupExercise.distance = this.planSessionGroupExercise.distance_type = this.planSessionGroupExercise.distance_unit =
      this.planSessionGroupExercise.distance_up_to = null;
    }
    else if (this.planSessionGroupExercise.exercise.exercise_type == ExerciseType.Cardio) {
      this.planSessionGroupExercise.repetition_type = this.planSessionGroupExercise.number_of_repetitions = 
      this.planSessionGroupExercise.number_of_repetitions_up_to = this.planSessionGroupExercise.working_weight_percentage = null;
    }
  }
}
