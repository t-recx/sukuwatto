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

  maximized: boolean = false;

  distanceSubject = new Subject<number>();
  distanceSubscription: Subscription;

  trackingType: GeoTrackingType = GeoTrackingType.None;
  collectingPositions: boolean = false;

  fitBounds: LatLngBounds = null;
  startText: string = "Start";

  options: any;

  faChartBar = faChartBar;
  faArrowLeft = faArrowLeft;
  faMapMarkedAlt = faMapMarkedAlt;

  BackgroundGeolocation = window['BackgroundGeolocation'];

  zoom: number = 8;

  layers: any;
  layersControl: any;

  route: Polyline<any, any> = null;

  center: LatLng = latLng(0, 0);

  faPlay = faPlay;
  faStop = faStop;
  faTimes = faTimes;
  faCheck = faCheck;
  faDotCircle = faDotCircle;
  faCompress = faCompress;
  faExpand = faExpand;
  faPause = faPause;

  userOperatingMap: boolean = false;

  watchId: number = null;

  initialized: boolean = false;

  deleteModalVisible: boolean = false;

  map: Map;

  currentView: GeoView = GeoView.Map;

  geoView = GeoView;

  secondsTimer: Observable<any>;
  timerSubscription: Subscription;
  ellapsedTime: string;

  caloriesDetailed: boolean = false;

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private workoutsService: WorkoutsService,
    private unitsService: UnitsService,
    private caloriesService: CaloriesService,
    private metsService: MetabolicEquivalentService,
    private timeService: TimeService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.exercise) {
      this.loadMETs();
      
      this.updateCalories();
    }
  }

  private loadMETs(): void {
    if (this.workoutActivity.exercise &&
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

  ngOnInit(): void {
    this.loadMETs();
    this.selectDistanceUnit();

    if (!this.workoutActivity.distance) {
      this.workoutActivity.distance = 0;
    }

    if (!this.workoutActivity.speed) {
      this.workoutActivity.speed = 0;
    }

    this.initMap();

    this.secondsTimer = timer(1000, 1000);
    this.ellapsedTime = this.getActiveTime();

    this.timerSubscription = this.secondsTimer
      .subscribe(() => {
        if (this.collectingPositions) {
          if (!this.workoutActivity.time_unit) {
            this.workoutActivity.time_unit = this.unitsService.getUnitList().filter(u => u.abbreviation == 'min')[0].id;
          }

          if (!this.workoutActivity.time) {
            this.workoutActivity.time = 0;
          }

          this.workoutActivity.time += this.unitsService.convert(1, 's', this.workoutActivity.time_unit);
          this.workoutActivity.time = this.round(this.workoutActivity.time);
        }

        if (this.currentView == GeoView.Stats) {
          this.ellapsedTime = this.getActiveTime();
        }
      });

    this.distanceSubscription = this.distanceSubject.subscribe(distance => {
      if (this.currentView == GeoView.Stats) {
        this.updateCalories();
        this.updateSpeed();
      }
    })
  }

  ngOnDestroy(): void {
    this.stopTracking();

    this.distanceSubscription.unsubscribe();
    this.timerSubscription.unsubscribe();
  }

  updateSpeed(): void {
    let hours = this.unitsService.convert(this.workoutActivity.time, this.workoutActivity.time_unit, 'hr');
    let speed = 0;
    let distance = 0;

    if (!this.speedUnit) {
      this.speedUnit = this.unitsService
      .getUnitList()
      .filter(u => u.system == this.authService.getUserUnitSystem() && u.measurement_type == MeasurementType.Speed)[0];
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
    this.caloriesDetailed = !this.caloriesDetailed;
  }

  showMap() {
    this.currentView = GeoView.Map;

    this.invalidateMapSize(false);
  }

  showStats() {
    this.currentView = GeoView.Stats;

    this.updateCalories();
    this.updateSpeed();
    this.ellapsedTime = this.getActiveTime();
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
    if (this.maximized) {
      this.changeInput(true);
    }
    else {
      if (this.collectingPositions) {
        this.changeInput(true);
      }
      else {
        this.changeInput(false);
      }
    }
  }

  toggleMaximize() {
    this.maximized = !this.maximized;

    if (this.currentView == GeoView.Map) {
      this.invalidateMapSize();
    }

    this.setInputAccordingToState();
  }

  maximize() {
    this.maximized = true;
    this.invalidateMapSize();

    this.setInputAccordingToState();
  }

  minimize() {
    this.maximized = false;
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
    this.center = latLng(position.latitude, position.longitude);
  }

  recenter() {
    this.userOperatingMap = false;

    if (this.workoutActivity.positions && this.workoutActivity.positions.length > 0) {
      this.centerOnPosition(this.workoutActivity.positions[this.workoutActivity.positions.length - 1]);
    }
  }

  startTracking() {
    if (this.BackgroundGeolocation) {
      // we're on a phone      
      this.trackingType = GeoTrackingType.BackgroundGeolocation;
      this.startBackgroundGeolocationTracking();
    }
    else if (navigator.geolocation) {
      // we have a geolocation compatible browser
      this.trackingType = GeoTrackingType.Navigator;
      this.startNavigatorTracking();
    }
    else {
      // ... can't track positions ...
      this.trackingType = GeoTrackingType.None;
      this.alertService.error('Can\'t start tracking: Unable to detect location device');
    }

    if (this.trackingType != GeoTrackingType.None) {
      this.workoutActivity.done = false;
      this.maximize();
    }

    this.userOperatingMap = false;
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
      debug: !environment.production,
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
        this.collectingPositions = true;
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
      this.collectingPositions = true;

      this.addPositionToRoute(position);

      this.watchId = navigator.geolocation.watchPosition(p => {
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
          accuracy: p.coords.accuracy,
          altitude: p.coords.altitude,
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          speed: p.coords.speed,
          timestamp: p.timestamp
        });
    }
    else {
      newPosition = new WorkoutSetPosition(
        {
          accuracy: p.accuracy,
          altitude: p.altitude,
          latitude: p.latitude,
          longitude: p.longitude,
          speed: p.speed,
          timestamp: p.time
        });
    }

    this.workoutActivity.positions.push(newPosition);

    this.updateRoute();

    this.centerOnLastPosition();

    return newPosition;
  }

  centerOnLastPosition() {
    if (!this.userOperatingMap && this.workoutActivity.positions && this.workoutActivity.positions.length > 0) {
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
    this.caloriesService.requestActivityCalories(
      this.userBioData,
      this.workout,
      this.workoutActivity
    ).subscribe(calories => this.workoutActivity.calories = calories);
  }

  stopTracking() {
    this.stopGeolocationPolling();
    this.fitToRouteBounds();
    this.setInputAccordingToState();

    this.updateCalories();
    this.updateSpeed();
  }

  stopGeolocationPolling() {
    switch (this.trackingType) {
      case GeoTrackingType.BackgroundGeolocation:
        this.BackgroundGeolocation.stop();
        this.BackgroundGeolocation.removeAllListeners();
        break;
      case GeoTrackingType.Navigator:
        if (this.watchId && navigator.geolocation) {
          navigator.geolocation.clearWatch(this.watchId);
        }
        break;
    }

    this.collectingPositions = false;
    this.trackingType = GeoTrackingType.None;
  }

  finishActivity() {
    this.stopGeolocationPolling();
    this.workoutActivity.done = true;

    if (this.workoutActivity.done) {
      this.workoutActivity.in_progress = false;
      this.workoutActivity.end = new Date();
    }

    this.minimize();
    this.updateCalories();
    this.updateSpeed();
  }

  onMapReady(map: Map) {
    this.map = map;

    if (!this.route || this.route.getLatLngs().length == 0) {
      this.zoom = 16;
      if (this.authService.isLoggedIn()) {
        this.workoutsService.getLastWorkoutPosition(this.authService.getUsername())
          .subscribe(position => {
            if (position.latitude) {
              map.setView(latLng(position.latitude, position.longitude), this.zoom);
            }
            else {
              map.setView(latLng(0, 0), this.zoom);
            }
          });
      }
      else {
        map.setView(latLng(0, 0), this.zoom);
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
      this.userOperatingMap = true;
    }
  }

  mapZoom(e: any) {
    if (e.originalEvent) {
      this.userOperatingMap = true;
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

    if (this.authService.getUserDistanceUnitId()) {
      let userUnit = units.filter(u => u.id == +this.authService.getUserDistanceUnitId())[0];

      if (userUnit.abbreviation == 'm') {
        this.workoutActivity.distance_unit = meters.id;
      }
      else {
        this.workoutActivity.distance_unit = userUnit.id;
      }
    }
    else {
      if (this.authService.getUserUnitSystem()) {
        if (this.authService.getUserUnitSystem() == 'm') {
          this.workoutActivity.distance_unit = meters.id;
        }
        else {
          this.workoutActivity.distance_unit = feet.id;
        }
      }
      else {
        this.workoutActivity.distance_unit = meters.id;
      }
    }

    this.distanceUnit = units.filter(u => u.id ==this.workoutActivity.distance_unit)[0];

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
      .sort((a, b) => a.timestamp - b.timestamp)
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