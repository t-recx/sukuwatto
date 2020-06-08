import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WorkingParameter } from '../working-parameter';
import { faTrash, faInfo, faWeightHanging, faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-working-parameters',
  templateUrl: './working-parameters.component.html',
  styleUrls: ['./working-parameters.component.css']
})
export class WorkingParametersComponent implements OnInit {
  @Input() workingParameters: WorkingParameter[];
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
    this.workingParameters.push(new WorkingParameter());
  }

  valid(): boolean {
    if (this.workingParameters) {
      for(let workingParameter of this.workingParameters) {
        if (!workingParameter.exercise) {
          return false;
        }

        if (!workingParameter.parameter_type) {
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

  remove(workingParameter: WorkingParameter): void {
    const index = this.workingParameters.indexOf(workingParameter, 0);
    if (index > -1) {
      this.workingParameters.splice(index, 1);
    }
  }
}
