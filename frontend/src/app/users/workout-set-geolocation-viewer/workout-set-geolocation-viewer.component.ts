import { Component, OnInit, Input } from '@angular/core';
import { Map, LatLngBounds, tileLayer, latLng, polyline, Polyline } from 'leaflet';
import { WorkoutSet } from '../workout-set';
import { WorkoutSetPosition } from '../workout-set-position';

@Component({
  selector: 'app-workout-set-geolocation-viewer',
  templateUrl: './workout-set-geolocation-viewer.component.html',
  styleUrls: ['./workout-set-geolocation-viewer.component.css']
})
export class WorkoutSetGeolocationViewerComponent implements OnInit {
  @Input() workoutActivity: WorkoutSet;
  @Input() zoomControl: boolean = true;

  fitBounds: LatLngBounds = null;

  options: any;

  route: Polyline<any, any> = null;

  initialized: boolean = false;

  // ---------------------

  layers: any;
  layersControl: any;

  map: Map;

  constructor(
  ) {
  }

  ngOnInit(): void {
    this.initPositionSortIndex();

    this.initMap();
  }

  private initPositionSortIndex() {
    if (this.workoutActivity.positions) {
      this.workoutActivity.positions.filter(x => !x.sortIndex && x.id).map(x => x.sortIndex = x.id);
    }
  }

  onMapReady(map: Map) {
    this.map = map;
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

  private fitToRouteBounds() {
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

  private getRoute(positions: WorkoutSetPosition[]): Polyline{
    let positionsArray = [];

    positions
      .sort((a, b) => a.sortIndex - b.sortIndex)
      .forEach(position => {
        positionsArray.push([position.latitude, position.longitude, position.altitude]);
      });

    return polyline(positionsArray);
  }
}