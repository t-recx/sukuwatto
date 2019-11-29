import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Exercise } from '../exercise';
import { WorkingWeight } from '../working-weight';
import { faTrash, faInfo } from '@fortawesome/free-solid-svg-icons';
import { Unit } from '../unit';

@Component({
  selector: 'app-working-weights',
  templateUrl: './working-weights.component.html',
  styleUrls: ['./working-weights.component.css']
})
export class WorkingWeightsComponent implements OnInit {
  @Input() workingWeights: WorkingWeight[];
  @Input() exercises: Exercise[];
  @Input() units: Unit[];
  @Input() triedToSave: boolean;
  @Input() visible: boolean;
  @Output() closed = new EventEmitter;

  faTrash = faTrash;
  faInfo = faInfo;

  constructor() { }

  ngOnInit() {
  }

  newItem(): void {
    this.workingWeights.push(new WorkingWeight());
  }

  hide(): void {
    this.visible = false;
    this.closed.emit();
  }

  remove(workingWeight: WorkingWeight): void {
    const index = this.workingWeights.indexOf(workingWeight, 0);
    if (index > -1) {
      this.workingWeights.splice(index, 1);
    }
  }
}
