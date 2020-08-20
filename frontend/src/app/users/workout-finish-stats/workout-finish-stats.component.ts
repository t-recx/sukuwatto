import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Workout } from '../workout';
import { Unit } from '../unit';
import { TimeService } from '../time.service';
import { UnitsService } from '../units.service';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-workout-finish-stats',
  templateUrl: './workout-finish-stats.component.html',
  styleUrls: ['./workout-finish-stats.component.css']
})
export class WorkoutFinishStatsComponent implements OnInit, OnChanges {
  @Input() workout: Workout;
  @Input() end: Date;
  @Output() timeClicked = new EventEmitter();

  ellapsedTime: string = null;

  speed: number;
  speedUnit: Unit;

  distance: number;
  distanceInSmallerUnit: number;
  distanceSmallerUnit: Unit;
  distanceUnit: Unit;

  calories: number;

  showStats: boolean = false;

  constructor(
    private authService: AuthService,
    private timeService: TimeService,
    private unitsService: UnitsService,
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const warmups = this.workout.groups.flatMap(w => w.warmups.map(s => s)) ?? [];
    const sets = this.workout.groups.flatMap(w => w.sets.map(s => s)) ?? [];

    const activities = [...warmups, ...sets];

    if (changes.end || changes.workout) {
      if (this.workout.start && this.end) {
        const ellapsedMilliseconds = this.end.valueOf() - this.workout.start.valueOf();
        const ellapsedHours = this.unitsService.convert(ellapsedMilliseconds, 'ms', 'hr');

        this.ellapsedTime = this.timeService.toHumanReadable(ellapsedMilliseconds, ellapsedHours < 1);
      }
    }

    if (changes.workout) {
      this.speed = null;
      this.distance = null;
      this.calories = null;

      this.selectDistanceAndSpeedUnit();

      const activitiesWithDistance = activities.filter(x => x.distance);

      if (activitiesWithDistance && activitiesWithDistance.length > 0) {
        this.distance = activitiesWithDistance
          .map(x => this.unitsService.convert(x.distance, x.distance_unit, this.distanceUnit))
          .reduce((a, b) => a + b, 0);

        this.distanceInSmallerUnit = this.unitsService.convert(this.distance, this.distanceUnit, this.distanceSmallerUnit);
      }

      const activitiesWithSpeed = activities.filter(x => x.speed);

      if (activitiesWithSpeed && activitiesWithSpeed.length > 0) {
        this.speed = activitiesWithSpeed
          .map(x => this.unitsService.convert(x.speed, x.speed_unit, this.speedUnit))
          .reduce((a,b) => a + b, 0);
      }

      this.calories = activities.filter(x => x.calories).reduce((a, b) => a + b.calories, 0);
    }

    this.showStats = this.speed != null || this.distance != null || this.calories != null || this.ellapsedTime != null;
  }

  timeClick() {
    this.timeClicked.emit();
  }

  private selectDistanceAndSpeedUnit() {
    let units = this.unitsService.getUnitList();
    let meters = units.filter(x => x.abbreviation == 'm')[0]
    let feet = units.filter(x => x.abbreviation == 'ft')[0]
    let distanceUnitID: number;

    if (this.authService.getUserDistanceUnitId()) {
      let userUnit = units.filter(u => u.id == +this.authService.getUserDistanceUnitId())[0];

      if (userUnit.abbreviation == 'm') {
        distanceUnitID = meters.id;
      }
      else {
        distanceUnitID = userUnit.id;
      }
    }
    else {
      if (this.authService.getUserUnitSystem()) {
        if (this.authService.getUserUnitSystem() == 'm') {
          distanceUnitID = meters.id;
        }
        else {
          distanceUnitID = feet.id;
        }
      }
      else {
        distanceUnitID = meters.id;
      }
    }

    this.distanceUnit = units.filter(u => u.id == distanceUnitID)[0];

    if (this.distanceUnit.abbreviation == 'km') {
      this.distanceSmallerUnit = units.filter(u => u.abbreviation == 'm')[0];
      this.speedUnit = units.filter(u => u.abbreviation == 'km/h')[0];
    }

    if (this.distanceUnit.abbreviation == 'mi') {
      this.distanceSmallerUnit = units.filter(u => u.abbreviation == 'ft')[0];
      this.speedUnit = units.filter(u => u.abbreviation == 'mph')[0];
    }
  }
}
