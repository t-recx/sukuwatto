import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-workout-set-geolocation',
  templateUrl: './workout-set-geolocation.component.html',
  styleUrls: ['./workout-set-geolocation.component.css']
})
export class WorkoutSetGeolocationComponent implements OnInit, OnDestroy {

  title: string = "android";
  ready: boolean = false;
  positions: Position[] = [];
  distinctPositions: Position[] = [];
  watchId: number;

  BackgroundGeolocation = window['BackgroundGeolocation'];

  constructor(private alertService: AlertService) {
  }

  ngOnDestroy(): void {
    //this.stopWatchingPosition();
    this.BackgroundGeolocation.removeAllListeners();
  }

  stopWatchingPosition() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  ngOnInit(): void {
  alert('cccc');
    //this.startWatchingPosition();
    this.backgroundGeolocationStart();
  }

  backgroundGeolocationStart() {
    this.BackgroundGeolocation.configure({
      locationProvider: this.BackgroundGeolocation.ACTIVITY_PROVIDER,
      desiredAccuracy: this.BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: true,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      // url: 'http://192.168.81.15:3000/location',
      // httpHeaders: {
      //   'X-FOO': 'bar'
      // },
      // // customize post properties
      // postTemplate: {
      //   lat: '@latitude',
      //   lon: '@longitude',
      //   foo: 'bar' // you can also add your own properties
      // }
    });

    this.BackgroundGeolocation.on('location',  (p) => {
      // handle your locations here
      // to perform long running operation on iOS
      // you need to create background task

      this.BackgroundGeolocation.startTask( (taskKey) => {
        // execute long running task
        // eg. ajax post location
        // IMPORTANT: task has to be ended by endTask

        this.positions.push(p);
        this.addDistinctPosition(p);
        alert(p);

        this.BackgroundGeolocation.endTask(taskKey);
      });
    });

    this.BackgroundGeolocation.on('stationary',  (stationaryLocation)  => {
      // handle stationary locations here
    });

    this.BackgroundGeolocation.on('error',  (error) => {
      alert('[ERROR] this.BackgroundGeolocation error: ' + error.code + ' - ' + error.message);
    });

    this.BackgroundGeolocation.on('start',  () => {
      alert('[INFO] this.BackgroundGeolocation service has been started');
    });

    this.BackgroundGeolocation.on('stop', () => {
      alert('[INFO] this.BackgroundGeolocation service has been stopped');
    });

    this.BackgroundGeolocation.on('authorization', (status) => {
      alert('[INFO] this.BackgroundGeolocation authorization status: ' + status);
      if (status !== this.BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(function () {
          var showSettings = confirm('App requires location tracking permission. Would you like to open app settings?');
          if (showSettings) {
            return this.BackgroundGeolocation.showAppSettings();
          }
        }, 1000);
      }
    });

    this.BackgroundGeolocation.on('background', () => {
      alert('[INFO] App is in background');
      // you can also reconfigure service (changes will be applied immediately)
      this.BackgroundGeolocation.configure({ debug: true });
    });

    this.BackgroundGeolocation.on('foreground', () => {
      alert('[INFO] App is in foreground');
      this.BackgroundGeolocation.configure({ debug: false });
    });

    this.BackgroundGeolocation.on('abort_requested', () => {
      alert('[INFO] Server responded with 285 Updates Not Required');

      // Here we can decide whether we want stop the updates or not.
      // If you've configured the server to return 285, then it means the server does not require further update.
      // So the normal thing to do here would be to `this.BackgroundGeolocation.stop()`.
      // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
    });

    this.BackgroundGeolocation.on('http_authorization', () => {
      alert('[INFO] App needs to authorize the http requests');
    });

        alert(this.BackgroundGeolocation);
    this.BackgroundGeolocation.checkStatus((status) => {
      alert('[INFO] this.BackgroundGeolocation service is running ' + status.isRunning);
      alert('[INFO] this.BackgroundGeolocation services enabled ' + status.locationServicesEnabled);
      alert('[INFO] this.BackgroundGeolocation auth status: ' + status.authorization);

      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        alert('triggering start?');
        alert(this.BackgroundGeolocation);
        alert(window['BackgroundGeolocation']);
        this.BackgroundGeolocation.start(); //triggers start on start event
      }
    });

  alert('dddd');
    // you can also just start without checking for status
    // this.BackgroundGeolocation.start();

    // Don't forget to remove listeners at some point!
    // this.BackgroundGeolocation.removeAllListeners();
  }

  startWatchingPosition() {
    this.watchId = navigator.geolocation.watchPosition(p => {
      this.positions.push(p);
      this.addDistinctPosition(p);
      alert(p);
    }, e => {
      // https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-geolocation/index.html#positionerror
      switch (e.code) {
        case 1: // permission denied
          this.alertService.error('Unable to obtain position: Permission denied');
          this.stopWatchingPosition();
          break;
        case 2: // position unavailable
          this.alertService.error('Unable to obtain position: Position unavailable');
          this.stopWatchingPosition();
          break;
        case 3: // timeout
          this.alertService.error('Unable to obtain position: Timeout');
          this.stopWatchingPosition();
          break;
      }

      alert(e);
    }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
  }

  addDistinctPosition(p: any) {
    if (this.distinctPositions.length == 0) {
      this.distinctPositions.push(p);
    }
    else {
      let lastPosition = this.distinctPositions[this.distinctPositions.length - 1];

      if (p.coords.latitude != lastPosition.coords.latitude &&
        p.coords.longitude != lastPosition.coords.longitude) {
        this.distinctPositions.push(p);
      }
    }
  }

}
