import { Component, OnInit, Input } from '@angular/core';
import { WorkingParameter } from '../working-parameter';
import { Exercise } from '../exercise';
import { Unit, MeasurementType } from '../unit';
import { AuthService } from 'src/app/auth.service';
import { UnitsService } from '../units.service';
@Component({
  selector: 'app-working-parameter',
  templateUrl: './working-parameter.component.html',
  styleUrls: ['./working-parameter.component.css']
})
export class WorkingParameterComponent implements OnInit {
  @Input() workingParameter: WorkingParameter;
  @Input() triedToSave: boolean;
  @Input() triedToHide: boolean;

  units: Unit[];

  constructor(
    private unitsService: UnitsService,
    private authService: AuthService) { }

  ngOnInit() {
    this.unitsService.getUnits().subscribe(u => {
      this.units = u.filter(x => x.measurement_type == MeasurementType.Weight);
      let unitSystem = this.authService.getUserUnitSystem();
      if (!this.workingParameter.unit && unitSystem) {
        let filteredUnits = this.units.filter(u => u.system == unitSystem && u.measurement_type == MeasurementType.Weight);

        if (filteredUnits && filteredUnits.length > 0) {
          this.workingParameter.unit = filteredUnits[0].id;
        }
      }
    });
  }

  onWeightChange(event) {
    this.workingParameter.manually_changed = true;
  }
}
