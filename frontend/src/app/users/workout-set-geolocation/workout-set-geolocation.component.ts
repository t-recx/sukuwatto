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

  constructor(private alertService: AlertService) {
  }

  ngOnDestroy(): void {
    this.stopWatchingPosition();
  }

  stopWatchingPosition() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  ngOnInit(): void {
    this.startWatchingPosition();
  }

  startWatchingPosition() {
    this.watchId = navigator.geolocation.watchPosition(p => {
      this.positions.push(p);
      this.addDistinctPosition(p);
      console.log(p);
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

      console.log(e);
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
