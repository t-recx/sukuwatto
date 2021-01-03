import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Feature } from '../feature';

@Component({
  selector: 'app-features-modal',
  templateUrl: './features-modal.component.html',
  styleUrls: ['./features-modal.component.css']
})
export class FeaturesModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() selected = new EventEmitter<Feature>();
  @Output() closed = new EventEmitter();

  faTimes = faTimes;

  page: number;

  constructor() { }

  ngOnInit(): void {
    this.page = 1;
  }

  select(feature): void {
    this.selected.emit(feature);
    this.close();
  }

  close(): void {
    this.closed.emit();
  }

}
