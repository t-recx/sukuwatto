import { Component, OnInit, Input } from '@angular/core';
import { WorkingWeight } from '../working-weight';
import { Exercise } from '../exercise';
import { Unit } from '../unit';

@Component({
  selector: 'app-working-weight',
  templateUrl: './working-weight.component.html',
  styleUrls: ['./working-weight.component.css']
})
export class WorkingWeightComponent implements OnInit {
  @Input() workingWeight: WorkingWeight;
  @Input() exercises: Exercise[];
  @Input() units: Unit[];
  @Input() triedToSave: boolean;

  constructor() { }

  ngOnInit() {
  }

}
