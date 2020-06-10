import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WorkoutSet } from '../workout-set';
import { Exercise, ExerciseType } from '../exercise';
import { RepetitionType, RepetitionTypeLabel, SpeedType, TimeType, DistanceType, Vo2MaxType } from '../plan-session-group-activity';
import { faCheck, faEdit, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Unit } from '../unit';
import { UnitsService } from '../units.service';

@Component({
  selector: 'app-workout-set',
  templateUrl: './workout-set.component.html',
  styleUrls: ['./workout-set.component.css']
})
export class WorkoutSetComponent implements OnInit {
  @Input() sets: WorkoutSet[];
  @Input() workoutActivity: WorkoutSet;
  @Input() triedToSave: boolean;
  @Output() statusChanged = new EventEmitter();

  units: Unit[];

  faCheck = faCheck;
  faEdit = faEdit;
  faTimesCircle = faTimesCircle;
  editing: boolean = false;
  editingRepetitions: boolean = false;

  repetitionType = RepetitionType;
  speedType = SpeedType;
  timeType = TimeType;
  distanceType = DistanceType;
  vo2MaxType = Vo2MaxType;

  constructor(
    private unitsService: UnitsService,
  ) { }

  ngOnInit() {
    if (!this.workoutActivity.exercise.id) {
      this.editing = true;
    }
    this.unitsService.getUnits().subscribe(u => this.units = u);
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

        if (this.workoutActivity.exercise) {
          if (this.workoutActivity.exercise.exercise_type == ExerciseType.Strength) {
            if (!this.workoutActivity.number_of_repetitions) {
              if (this.workoutActivity.repetition_type == RepetitionType.Standard) {
                this.workoutActivity.number_of_repetitions = this.workoutActivity.expected_number_of_repetitions;
              }
              else if (this.workoutActivity.repetition_type == RepetitionType.Range) {
                this.editingRepetitions = true;
              }
              else if (this.workoutActivity.repetition_type != RepetitionType.None) {
                this.editingRepetitions = true;
              }
            }
          }
          else if (this.workoutActivity.exercise.exercise_type == ExerciseType.Cardio) {
            if (!this.workoutActivity.distance) {
              if (this.workoutActivity.distance_type && this.workoutActivity.distance_type != DistanceType.None) {
                if (this.workoutActivity.expected_distance) {
                  this.workoutActivity.distance = this.workoutActivity.expected_distance;
                }
              }
            }

            if (!this.workoutActivity.speed) {
              if (this.workoutActivity.speed_type && this.workoutActivity.speed_type != SpeedType.None) {
                if (this.workoutActivity.expected_speed) {
                  this.workoutActivity.speed = this.workoutActivity.expected_speed;
                }
              }
            }

            if (!this.workoutActivity.time) {
              if (this.workoutActivity.time_type && this.workoutActivity.time_type != TimeType.None) {
                if (this.workoutActivity.expected_time) {
                  this.workoutActivity.time = this.workoutActivity.expected_time;
                }
              }
            }

            if (!this.workoutActivity.vo2max) {
              if (this.workoutActivity.vo2max_type && this.workoutActivity.vo2max_type != Vo2MaxType.None) {
                if (this.workoutActivity.expected_vo2max) {
                  this.workoutActivity.vo2max = this.workoutActivity.expected_vo2max;
                }
              }
            }
          }
        }
      }
      else {
        this.workoutActivity.in_progress = false;
        this.workoutActivity.start = null;
        this.workoutActivity.end = null;
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

  onCloneOrder(n: number): void {
    let order: number = 1;

    for (let index = 0; index < n; index++) {
      if (this.sets && this.sets.length > 0) {
        order = Math.max(...this.sets.map(x => x.order));
        order += 1;
      }

      this.sets.push(new WorkoutSet({...this.workoutActivity, order}));
    }
  }

  getUnitCode(unit: number): string {
    return this.unitsService.getUnitCode(unit);
  }
}
