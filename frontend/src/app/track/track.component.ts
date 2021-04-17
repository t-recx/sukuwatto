import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.css']
})
export class TrackComponent implements OnInit {

  selectedImageIndex = 0;

  constructor() { }

  ngOnInit(): void {
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }
}
