import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { tileLayer, latLng } from 'leaflet';
import { WorkoutSet } from '../workout-set';
import { EventEmitter } from 'protractor';

@Component({
  selector: 'app-workout-set-geolocation',
  templateUrl: './workout-set-geolocation.component.html',
  styleUrls: ['./workout-set-geolocation.component.css']
})
export class WorkoutSetGeolocationComponent implements OnInit, OnDestroy {
  @Input() workoutActivity: WorkoutSet;
  @Input() triedToSave: boolean;
  @Output() statusChanged = new EventEmitter();

  options: any;

  constructor() {
  }

  private initMap(): void {
    this.options = {
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        })
      ],
      zoom: 7,
      center: latLng([ 46.879966, -121.726909 ])
    };
  }

  ngOnInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
  }
}
