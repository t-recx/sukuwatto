import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Map, LatLng, LatLngBounds, tileLayer, latLng, polyline, Polyline } from 'leaflet';
import { WorkoutSet } from '../workout-set';
import { WorkoutSetPosition } from '../workout-set-position';
import { WorkoutsService } from '../workouts.service';
import { AuthService } from 'src/app/auth.service';
import { faPlay, faStop, faTimes, faCheck, faDotCircle, faCompress, faExpand, faPause } from '@fortawesome/free-solid-svg-icons';
import { AlertService } from 'src/app/alert/alert.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-workout-set-geolocation',
  templateUrl: './workout-set-geolocation.component.html',
  styleUrls: ['./workout-set-geolocation.component.css']
})
export class WorkoutSetGeolocationComponent implements OnInit, OnDestroy {
  @Input() workoutActivity: WorkoutSet;
  @Input() allowEdit: boolean;
  @Input() zoomControl: boolean = true;

  maximized: boolean = false;

  trackingType: GeoTrackingType = GeoTrackingType.None;
  collectingPositions: boolean = false;

  fitBounds: LatLngBounds = null;
  startText: string = "Start";

  options: any;

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

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private workoutsService: WorkoutsService,
  ) {
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

  invalidateMapSize() {
    if (this.map) {
      setTimeout(() =>  {
        this.map.invalidateSize(false);
        this.centerOnLastPosition();
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
    this.invalidateMapSize();

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

  stopTracking() {
    this.stopGeolocationPolling();
    this.fitToRouteBounds();
    this.setInputAccordingToState();
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
    this.minimize();
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

  ngOnInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.stopTracking();
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

  private updateRoute() {
    if (this.workoutActivity.positions &&
      this.workoutActivity.positions.length > 0) {
      this.route = this.getRoute(this.workoutActivity.positions);
      this.startText = 'Continue';
    }
    else {
      this.startText = 'Start';
    }
  }

  private getRoute(positions: WorkoutSetPosition[]): any {
    let positionsArray = [];

    positions
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(position => {
        positionsArray.push([position.latitude, position.longitude, position.altitude]);
      });

    return polyline(positionsArray);
  }
}

export enum GeoTrackingType {
  None = 0,
  BackgroundGeolocation = 1,
  Navigator = 2,
}