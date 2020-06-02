import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WorkingWeight } from '../working-weight';
import { faTrash, faInfo, faWeightHanging, faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-working-weights',
  templateUrl: './working-weights.component.html',
  styleUrls: ['./working-weights.component.css']
})
export class WorkingWeightsComponent implements OnInit {
  @Input() workingWeights: WorkingWeight[];
  @Input() triedToSave: boolean;
  @Input() visible: boolean;
  @Output() closed = new EventEmitter();

  triedToHide: boolean;
  faTrash = faTrash;
  faInfo = faInfo;
  faWeightHanging = faWeightHanging;
  faCheck = faCheck;

  constructor() { }

  ngOnInit() {
    this.triedToHide = false;
  }

  newItem(): void {
    this.workingWeights.push(new WorkingWeight());
  }

  valid(): boolean {
    if (this.workingWeights) {
      for(let workingWeight of this.workingWeights) {
        if (!workingWeight.exercise) {
          return false;
        }
      }
    }

    return true;
  }

  hide(): void {
    this.triedToHide = true;

    if (!this.valid()) {
      return;
    }

    this.visible = false;
    this.triedToHide = false;
    this.closed.emit();
  }

  remove(workingWeight: WorkingWeight): void {
    const index = this.workingWeights.indexOf(workingWeight, 0);
    if (index > -1) {
      this.workingWeights.splice(index, 1);
    }
  }
}
