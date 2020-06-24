import { Component, OnInit, OnDestroy, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { Map, LatLng, LatLngBounds, tileLayer, latLng, polyline, point, Polyline } from 'leaflet';
import { WorkoutSet } from '../workout-set';
import { WorkoutSetPosition } from '../workout-set-position';
import { WorkoutsService } from '../workouts.service';
import { AuthService } from 'src/app/auth.service';
import { faPlay, faStop, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
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
  @Input() disableInput: boolean = false;

  trackingType: GeoTrackingType = GeoTrackingType.None;
  collectingPositions: boolean = false;

  fitBounds: LatLngBounds = null;

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

  watchId: number = null;

  initialized: boolean = false;

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private workoutsService: WorkoutsService,
  ) {
  }

  disableTracking() {
    this.workoutActivity.tracking = false;
  }


  centerOnPosition(position: WorkoutSetPosition) {
    this.center = latLng(position.latitude, position.longitude);
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
    }
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

    this.BackgroundGeolocation.on('error',  (error) => {
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
      this.addPositionToRoute(position);

      this.watchId = navigator.geolocation.watchPosition(p => {
        this.workoutActivity.tracking = true;
        this.collectingPositions = true;

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
    this.centerOnPosition(newPosition);

    return newPosition;
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
    this.stopTracking();
    this.workoutActivity.done = true;
  }

  onMapReady(map: Map) {
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

    this.layers = [ streetMaps ];

    this.options = {
      layers: [
        streetMaps
      ],
      zoom: 0,
      zoomControl: this.zoomControl,
      scrollWheelZoom: this.disableInput ? false : true,
      dragging: this.disableInput ? false : true,
      tap: this.disableInput ? false : true,
      center: latLng([ 0, 0 ])
    };

    if (this.route && this.route.getLatLngs().length > 1) {
      this.fitBounds = this.route.getBounds();
    }
  }

  private updateRoute() {
    if (this.workoutActivity.positions &&
      this.workoutActivity.positions.length > 0) {
      this.route = this.getRoute(this.workoutActivity.positions);
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