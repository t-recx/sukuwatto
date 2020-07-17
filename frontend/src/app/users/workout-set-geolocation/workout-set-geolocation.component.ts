import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Map, LatLng, LatLngBounds, tileLayer, latLng, polyline, Polyline } from 'leaflet';
import { WorkoutSet } from '../workout-set';
import { WorkoutSetPosition } from '../workout-set-position';
import { WorkoutsService } from '../workouts.service';
import { AuthService } from 'src/app/auth.service';
import { faPlay, faStop, faTimes, faCheck, faDotCircle, faCompress, faExpand, faPause, faChartBar, faArrowLeft, faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons';
import { AlertService } from 'src/app/alert/alert.service';
import { environment } from 'src/environments/environment';
import { DistanceType } from '../plan-session-group-activity';
import { UnitsService } from '../units.service';
import { Subject, Subscription, timer, Observable } from 'rxjs';
import { CaloriesService } from '../calories.service';
import { UserBioData } from '../user-bio-data';
import { Workout } from '../workout';
import { Unit, MeasurementType } from '../unit';
import { MetabolicEquivalentTask } from '../metabolic-equivalent-task';
import { MetabolicEquivalentService } from '../metabolic-equivalent.service';
import { Exercise } from '../exercise';
import { TimeService } from '../time.service';
import { WorkoutSetTimeSegment } from '../workout-set-time-segment';
import { Router } from '@angular/router';
import { CordovaService } from 'src/app/cordova.service';

@Component({
  selector: 'app-workout-set-geolocation',
  templateUrl: './workout-set-geolocation.component.html',
  styleUrls: ['./workout-set-geolocation.component.css']
})
export class WorkoutSetGeolocationComponent implements OnInit, OnDestroy, OnChanges {
  @Input() workoutActivity: WorkoutSet;
  @Input() allowEdit: boolean;
  @Input() zoomControl: boolean = true;
  @Input() userBioData: UserBioData;
  @Input() workout: Workout;
  @Input() exercise: Exercise;

  mets: MetabolicEquivalentTask[];

  speedUnit: Unit;

  distanceUnit: Unit;
  distanceInSmallerUnit: number = 0;
  distanceSmallerUnit: Unit;

  distanceSubject = new Subject<number>();
  distanceSubscription: Subscription;

  fitBounds: LatLngBounds = null;
  startText: string = "Start";

  options: any;

  route: Polyline<any, any> = null;

  initialized: boolean = false;

  deleteModalVisible: boolean = false;

  allowToggleSize: boolean = true;

  pausedSubscription: Subscription;

  // ---------------------

  layers: any;
  layersControl: any;

  map: Map;

  geoView = GeoView;

  secondsTimer: Observable<any>;
  timerSubscription: Subscription;

  faPlay = faPlay;
  faStop = faStop;
  faTimes = faTimes;
  faCheck = faCheck;
  faDotCircle = faDotCircle;
  faCompress = faCompress;
  faExpand = faExpand;
  faPause = faPause;

  faChartBar = faChartBar;
  faArrowLeft = faArrowLeft;
  faMapMarkedAlt = faMapMarkedAlt;

  BackgroundGeolocation = window['BackgroundGeolocation'];

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private workoutsService: WorkoutsService,
    private unitsService: UnitsService,
    private caloriesService: CaloriesService,
    private metsService: MetabolicEquivalentService,
    private timeService: TimeService,
    private router: Router,
    private cordovaService: CordovaService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.exercise) {
      this.loadMETs();
      
      this.updateCalories();

      this.allowToggleSize = !this.workoutActivity.quick;

      if (this.workoutActivity.quick) {
        this.maximize();
      }
    }
  }

  private loadMETs(): void {
    if (this.allowEdit &&
      this.workoutActivity.exercise &&
      this.workoutActivity.exercise.id) {
      this
      .metsService
      .getMets(this.workoutActivity.exercise.id)
      .subscribe(mets => this.mets = mets);
    }
  }

  private round(num: number, decplaces = 3): number {
    let pow = Math.pow(10, decplaces);
    return Math.round((num + Number.EPSILON) * pow) / pow;
  }

  restore() {
    this.updateTime();
    this.updateSpeed();

    if (this.workoutActivity.tracking && this.workoutActivity.collectingPositions &&
      this.workoutActivity.trackingType == GeoTrackingType.BackgroundGeolocation) {

      if (this.BackgroundGeolocation) {
        this.BackgroundGeolocation.getLocations((locations) => {
          if (locations && locations.length > 0) {
            locations.map(l => this.addPositionToRoute(l));
          }
        });

        this.startBackgroundGeolocationTracking(); // reconfigure

        this.BackgroundGeolocation.start(); // force it to restart again
      }
    }
  }

  initActivityParameters() {
    if (this.workoutActivity) {
      if (!this.workoutActivity.trackingType) {
        this.workoutActivity.trackingType = GeoTrackingType.None;
      }

      if (!this.workoutActivity.zoom) {
        this.workoutActivity.zoom = 8;
      }

      if (!this.workoutActivity.center) {
        this.workoutActivity.center = latLng(0, 0);
      }

      if (!this.workoutActivity.currentView) {
        this.workoutActivity.currentView = GeoView.Map;
      }
    }
  }

  pause() {
    if (this.BackgroundGeolocation) {
      this.BackgroundGeolocation.deleteAllLocations(() => {});
    }
  }

  ngOnInit(): void {
    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.pause());

    this.initActivityParameters();

    this.loadMETs();
    this.selectDistanceUnit();

    if (!this.workoutActivity.distance) {
      this.workoutActivity.distance = 0;
    }

    if (!this.workoutActivity.speed) {
      this.workoutActivity.speed = 0;
    }

    if (!this.workoutActivity.time) {
      this.workoutActivity.time = 0;
    }

    this.initPositionSortIndex();

    this.initMap();
    this.updateSpeed();

    this.secondsTimer = timer(500, 500);
    this.workoutActivity.ellapsedTime = this.getActiveTime();

    if (this.workoutActivity.suspended) {
      this.restore();
    }

    this.timerSubscription = this.secondsTimer
      .subscribe(() => {
        this.updateTime();

        if (this.workoutActivity.currentView == GeoView.Stats) {
          this.workoutActivity.ellapsedTime = this.getActiveTime();
        }
      });

    this.distanceSubscription = this.distanceSubject.subscribe(distance => {
      if (this.workoutActivity.currentView == GeoView.Stats) {
        this.updateCalories();
        this.updateSpeed();
      }
    })
  }

  private initPositionSortIndex() {
    if (this.workoutActivity.positions) {
      this.workoutActivity.positions.filter(x => !x.sortIndex && x.id).map(x => x.sortIndex = x.id);
    }
  }

  ngOnDestroy(): void {
    this.workoutActivity.suspended = false;

    this.stopTracking();

    this.pausedSubscription.unsubscribe();
    this.distanceSubscription.unsubscribe();
    this.timerSubscription.unsubscribe();
  }

  updateSpeed(): void {
    let hours = this.unitsService.convert(this.workoutActivity.time, this.workoutActivity.time_unit, 'hr');
    let speed = 0;
    let distance = 0;

    if (!this.speedUnit) {
      if (this.authService.getUserUnitSystem()) {
        this.speedUnit = this.unitsService
        .getUnitList()
        .filter(u => u.system == this.authService.getUserUnitSystem() && u.measurement_type == MeasurementType.Speed)[0];
      }
      else {
        this.speedUnit = this.unitsService
        .getUnitList()
        .filter(u => u.abbreviation == 'km/h')[0];
      }
    }

    if (this.speedUnit) {
      if (this.speedUnit.abbreviation == 'km/h') {
        distance = this.unitsService.convert(this.workoutActivity.distance, this.workoutActivity.distance_unit, 'km');
      }

      if (this.speedUnit.abbreviation == 'mph') {
        distance = this.unitsService.convert(this.workoutActivity.distance, this.workoutActivity.distance_unit, 'mi');
      }

      if (hours && hours > 0) {
        speed = this.round(distance / hours, 2);
      }
      else {
        speed = 0;
      }

      this.workoutActivity.speed = speed;
      this.workoutActivity.speed_unit = this.speedUnit.id;
    }
    else {
      this.workoutActivity.speed = 0;
    }
  }

  toggleCaloriesDetail() {
    this.workoutActivity.caloriesDetailed = !this.workoutActivity.caloriesDetailed;
  }

  showMap() {
    this.workoutActivity.currentView = GeoView.Map;

    this.invalidateMapSize(false);
  }

  showStats() {
    this.workoutActivity.currentView = GeoView.Stats;

    if (this.allowEdit) {
      this.updateCalories();
      this.updateSpeed();
    }
    this.workoutActivity.ellapsedTime = this.getActiveTime();
  }

  setMETbyUser() {
    this.workoutActivity.met_set_by_user = true;
  }

  changeInput(allow: boolean) {
    if (this.map) {
      if (allow) {
        this.map.scrollWheelZoom.enable();
        this.map.dragging.enable();

        if (this.map.tap) {
          this.map.tap.enable();
        }
      }
      else {
        this.map.scrollWheelZoom.disable();
        this.map.dragging.disable();

        if (this.map.tap) {
          this.map.tap.disable();
        }
      }
    }
  }

  invalidateMapSize(center: boolean = true) {
    if (this.map) {
      setTimeout(() =>  {
        this.map.invalidateSize(false);
        if (center) {
          this.centerOnLastPosition();
        }
        this.fitToRouteBounds();
      }, 100);
    }
  }

  setInputAccordingToState() {
    if (this.workoutActivity.maximized) {
      this.changeInput(true);
    }
    else {
      if (this.workoutActivity.collectingPositions) {
        this.changeInput(true);
      }
      else {
        this.changeInput(false);
      }
    }
  }

  toggleMaximize() {
    this.workoutActivity.maximized = !this.workoutActivity.maximized;

    if (this.workoutActivity.currentView == GeoView.Map) {
      this.invalidateMapSize();
    }

    this.setInputAccordingToState();
  }

  maximize() {
    this.workoutActivity.maximized = true;
    this.invalidateMapSize();

    this.setInputAccordingToState();
  }

  minimize() {
    this.workoutActivity.maximized = false;
    this.invalidateMapSize();

    this.fitToRouteBounds();
    this.setInputAccordingToState();
  }

  toggleDeleteModal() {
    this.deleteModalVisible = !this.deleteModalVisible;
  }

  disableTrackingAndClearPositions() {
    this.workoutActivity.tracking = false;
    this.workoutActivity.positions = [];
    this.workoutActivity.segments = [];

    if (this.workoutActivity.quick) {
      this.router.navigateByUrl('/');
    }
  }

  disableTracking() {
    if (this.workoutActivity.positions && this.workoutActivity.positions.length > 0) {
      this.toggleDeleteModal();
    }
    else {
      this.disableTrackingAndClearPositions();
    }
  }

  centerOnPosition(position: WorkoutSetPosition) {
    this.workoutActivity.center = latLng(position.latitude, position.longitude);
  }

  recenter() {
    this.workoutActivity.userOperatingMap = false;

    if (this.workoutActivity.positions && this.workoutActivity.positions.length > 0) {
      this.centerOnPosition(this.workoutActivity.positions[this.workoutActivity.positions.length - 1]);
    }
  }

  startTracking() {
    if (this.BackgroundGeolocation) {
      // we're on a phone
      this.workoutActivity.trackingType = GeoTrackingType.BackgroundGeolocation;
      this.startBackgroundGeolocationTracking();
    }
    else if (navigator.geolocation) {
      // we have a geolocation compatible browser
      this.workoutActivity.trackingType = GeoTrackingType.Navigator;
      this.startNavigatorTracking();
    }
    else {
      // ... can't track positions ...
      this.workoutActivity.trackingType = GeoTrackingType.None;
      this.alertService.error('Can\'t start tracking: Unable to detect location device');
    }

    if (this.workoutActivity.trackingType != GeoTrackingType.None) {
      this.createNewTimeSegment();
      this.workoutActivity.done = false;
      this.maximize();
    }

    this.workoutActivity.userOperatingMap = false;
    this.setInputAccordingToState();
  }

  startBackgroundGeolocationTracking() {
    this.BackgroundGeolocation.configure({
      locationProvider: this.BackgroundGeolocation.ACTIVITY_PROVIDER,
      desiredAccuracy: this.BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 10,
      distanceFilter: 50,
      notificationTitle: 'Sukuwatto',
      notificationText: 'Tracking GPS location',
      debug: false,
      interval: 5000,
      fastestInterval: 5000,
      activitiesInterval: 5000,
      activityType: 'Fitness',
      maxLocations: 30000,
    });

    this.BackgroundGeolocation.on('location', (p) => {
      this.BackgroundGeolocation.startTask((taskKey) => {
        this.addPositionToRoute(p);

        this.BackgroundGeolocation.endTask(taskKey);
      });
    });

    this.BackgroundGeolocation.on('error', (error) => {
      console.log('[ERROR] this.BackgroundGeolocation error: ' + error.code + ' - ' + error.message);

      this.alertPositionError(error.code);
    });

    this.BackgroundGeolocation.on('stop', () => {
      this.stopTracking();
    });

    this.BackgroundGeolocation.on('authorization', (status) => {
      if (status !== this.BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(function () {
          const showSettings = confirm('Sukuwatto requires location tracking permission. Would you like to open app settings?');

          if (showSettings) {
            return this.BackgroundGeolocation.showAppSettings();
          }
        }, 1000);
      }
    });

    this.BackgroundGeolocation.checkStatus((status) => {
      if (!status.isRunning) {
        this.BackgroundGeolocation.start();
        this.workoutActivity.tracking = true;
        this.workoutActivity.collectingPositions = true;
      }
    });
  }

  startNavigatorTracking() {
    // We'll do a poll of the current position first, if it's okay
    // then we'll set up a watch
    // otherwise, we don't do anything.
    // I have to do this because if the watch errors, it's impossible to stop the watch
    // since there's no watchId
    navigator.geolocation.getCurrentPosition(position => {
      this.workoutActivity.tracking = true;
      this.workoutActivity.collectingPositions = true;

      this.addPositionToRoute(position);

      this.workoutActivity.watchId = navigator.geolocation.watchPosition(p => {
        this.addPositionToRoute(p);
      }, e => {
        this.alertPositionError(e.code);
      }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
    }, e => {
      this.alertPositionError(e.code);
      this.stopTracking();
    }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
  }

  private addPositionToRoute(p: Position | any) {
    if (!this.workoutActivity.positions) {
      this.workoutActivity.positions = [];
    }

    let newPosition;

    if (p.coords) {
      newPosition = new WorkoutSetPosition(
        {
          altitude: p.coords.altitude,
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
        });
    }
    else {
      newPosition = new WorkoutSetPosition(
        {
          altitude: p.altitude,
          latitude: p.latitude,
          longitude: p.longitude,
        });
    }

    if (this.workoutActivity.positions.length > 0) {
      newPosition.sortIndex = this.workoutActivity.positions[this.workoutActivity.positions.length - 1].sortIndex + 1;
    }
    else {
      newPosition.sortIndex = 1;
    }

    this.workoutActivity.positions.push(newPosition);

    this.updateRoute();

    this.centerOnLastPosition();

    return newPosition;
  }

  centerOnLastPosition() {
    if (!this.workoutActivity.userOperatingMap && this.workoutActivity.positions && this.workoutActivity.positions.length > 0) {
      this.centerOnPosition(this.workoutActivity.positions[this.workoutActivity.positions.length - 1]);
    }
  }

  private alertPositionError(code) {
    // https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-geolocation/index.html#positionerror

    this.alertService.clear();

    switch (code) {
      case 1: // permission denied
        this.alertService.error('Unable to obtain position: Permission denied');
        break;
      case 2: // position unavailable
        this.alertService.error('Unable to obtain position: Position unavailable');
        break;
      case 3: // timeout
        this.alertService.error('Unable to obtain position: Timeout');
        break;
    }
  }

  updateCalories() {
    if (this.allowEdit) {
      this.caloriesService.requestActivityCalories(
        this.userBioData,
        this.workout,
        this.workoutActivity
      ).subscribe(calories => this.workoutActivity.calories = calories);
    }
  }

  stopTracking() {
    this.closeTimeSegment();
    this.stopGeolocationPolling();
    this.fitToRouteBounds();
    this.setInputAccordingToState();

    this.updateCalories();
    this.updateSpeed();
  }

  closeTimeSegment() {
    if (!this.workoutActivity.segments || this.workoutActivity.segments.length == 0) {
      return;
    }

    this.workoutActivity.segments[this.workoutActivity.segments.length - 1].end = new Date();
  }

  createNewTimeSegment() {
    if (!this.workoutActivity.segments) {
      this.workoutActivity.segments = [];
    }

    if (this.workoutActivity.segments.filter(x => !x.end).length == 0) {
      this.workoutActivity.segments.push(this.getNewTimeSegment());
    }
  }

  getNewTimeSegment() {
    return new WorkoutSetTimeSegment({start: new Date()});
  }

  stopGeolocationPolling() {
    switch (this.workoutActivity.trackingType) {
      case GeoTrackingType.BackgroundGeolocation:
        this.BackgroundGeolocation.stop();
        this.BackgroundGeolocation.deleteAllLocations(() => {});
        this.BackgroundGeolocation.removeAllListeners();
        break;
      case GeoTrackingType.Navigator:
        if (this.workoutActivity.watchId && navigator.geolocation) {
          navigator.geolocation.clearWatch(this.workoutActivity.watchId);
        }
        break;
    }

    this.workoutActivity.collectingPositions = false;
    this.workoutActivity.trackingType = GeoTrackingType.None;
  }

  finishActivity() {
    this.closeTimeSegment();
    this.stopGeolocationPolling();
    this.workoutActivity.done = true;

    if (this.workoutActivity.done) {
      this.workoutActivity.in_progress = false;
      this.workoutActivity.end = new Date();
    }

    this.minimize();
    this.updateCalories();
    this.updateSpeed();

    this.workoutsService.finishGeolocationActivity();
  }

  onMapReady(map: Map) {
    this.map = map;

    if (!this.route || this.route.getLatLngs().length == 0) {
      this.workoutActivity.zoom = 16;
      if (this.authService.isLoggedIn()) {
        this.workoutsService.getLastWorkoutPosition(this.authService.getUsername())
          .subscribe(position => {
            if (position.latitude) {
              map.setView(latLng(position.latitude, position.longitude), this.workoutActivity.zoom);
            }
            else {
              map.setView(latLng(0, 0), this.workoutActivity.zoom);
            }
          });
      }
      else {
        map.setView(latLng(0, 0), this.workoutActivity.zoom);
      }
    }
  }

  private initMap(): void {
    // Define our base layers so we can reference them multiple times
    this.updateRoute();

    let streetMaps = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      detectRetina: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    let wMaps = tileLayer('http://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
      detectRetina: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    this.layersControl = {
      baseLayers: {
        'Street Maps': streetMaps,
        'Wikimedia Maps': wMaps
      }
    };

    this.layers = [streetMaps];

    this.options = {
      layers: [
        streetMaps
      ],
      zoom: 0,
      zoomControl: this.zoomControl,
      scrollWheelZoom: false,
      dragging: false,
      tap: false,
      center: latLng([0, 0])
    };

    this.fitToRouteBounds();
  }

  mapMove(e: any) {
    if (e.originalEvent) {
      this.workoutActivity.userOperatingMap = true;
    }
  }

  mapZoom(e: any) {
    if (e.originalEvent) {
      this.workoutActivity.userOperatingMap = true;
    }
  }

  private fitToRouteBounds() {
    if (this.route && this.route.getLatLngs().length > 1) {
      this.fitBounds = this.route.getBounds();
    }
  }

  private selectDistanceUnit() {
    let units = this.unitsService.getUnitList();
    let meters = units.filter(x => x.abbreviation == 'm')[0]
    let feet = units.filter(x => x.abbreviation == 'ft')[0]
    let kilometers = units.filter(x => x.abbreviation == 'km')[0]
    let miles = units.filter(x => x.abbreviation == 'mi')[0]

    if (this.authService.getUserUnitSystem()) {
      if (this.authService.getUserUnitSystem() == 'm') {
        this.workoutActivity.distance_unit = kilometers.id;
      }
      else {
        this.workoutActivity.distance_unit = miles.id;
      }
    }
    else {
      this.workoutActivity.distance_unit = kilometers.id;
    }

    this.distanceUnit = units.filter(u => u.id == this.workoutActivity.distance_unit)[0];

    if (this.distanceUnit.abbreviation == 'km') {
      this.distanceSmallerUnit = units.filter(u => u.abbreviation == 'm')[0];
    }

    if (this.distanceUnit.abbreviation == 'mi') {
      this.distanceSmallerUnit = units.filter(u => u.abbreviation == 'ft')[0];
    }
  }


  private updateRoute() {
    if (this.workoutActivity.positions &&
      this.workoutActivity.positions.length > 0) {
      this.route = this.getRoute(this.workoutActivity.positions);

      let distance = Math.round(this.calculateDistanceMeters(this.workoutActivity.positions));

      this.workoutActivity.distance_type = DistanceType.Standard;
      this.workoutActivity.distance = this.unitsService.convert(distance, 'm', this.workoutActivity.distance_unit);

      if (this.distanceSmallerUnit) {
        this.distanceInSmallerUnit = this.unitsService.convert(distance, 'm', this.distanceSmallerUnit);
      }

      this.distanceSubject.next(this.workoutActivity.distance);

      this.startText = 'Continue';
    }
    else {
      this.startText = 'Start';
    }
  }

  private toLatLng(currentValue: WorkoutSetPosition) {
    return new LatLng(currentValue.latitude, currentValue.longitude, currentValue.altitude)
  }

  private calculateDistanceMeters(positions: WorkoutSetPosition[]): number {
    if (!positions || positions.length < 1) {
      return 0;
    }

    return positions
    .reduce((accumulator, currentValue, currentIndex, array) => 
      accumulator + (currentIndex == array.length - 1 ? 0 : 
        this.toLatLng(currentValue).distanceTo(
          this.toLatLng(array[currentIndex + 1])
        )), 0);

  }

  private getRoute(positions: WorkoutSetPosition[]): Polyline{
    let positionsArray = [];

    positions
      .sort((a, b) => a.sortIndex - b.sortIndex)
      .forEach(position => {
        positionsArray.push([position.latitude, position.longitude, position.altitude]);
      });

    return polyline(positionsArray);
  }

  private getActiveTime() {
    if (!this.workoutActivity.time) {
      return this.timeService.toHumanReadable(0);
    }

    return this.timeService.toHumanReadable(this.unitsService.convert(this.workoutActivity.time, this.workoutActivity.time_unit, 'ms'));
  }

  private updateTime() {
    if (this.workoutActivity.segments) {
      if (!this.workoutActivity.time_unit) {
        this.workoutActivity.time_unit = this.unitsService.getUnitList().filter(u => u.abbreviation == 'min')[0].id;
      }

      this.workoutActivity.time =
        this.unitsService.convert(
          this.workoutActivity
            .segments
            .reduce((a, b) => a + ((b.end ?? new Date()).valueOf() - b.start.valueOf()), 0), 'ms', this.workoutActivity.time_unit);

      this.workoutActivity.time = this.round(this.workoutActivity.time);
    }
  }
}

export enum GeoTrackingType {
  None = 0,
  BackgroundGeolocation = 1,
  Navigator = 2,
}

export enum GeoView {
  Map = 0,
  Stats = 1,
}