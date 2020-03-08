import { Component, OnInit, Input } from '@angular/core';
import { WorkingWeight } from '../working-weight';
import { Exercise } from '../exercise';
import { Unit, MeasurementType } from '../unit';
import { AuthService } from 'src/app/auth.service';
import { UnitsService } from '../units.service';
@Component({
  selector: 'app-working-weight',
  templateUrl: './working-weight.component.html',
  styleUrls: ['./working-weight.component.css']
})
export class WorkingWeightComponent implements OnInit {
  @Input() workingWeight: WorkingWeight;
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
      if (!this.workingWeight.unit && unitSystem) {
        let filteredUnits = this.units.filter(u => u.system == unitSystem && u.measurement_type == MeasurementType.Weight);

        if (filteredUnits && filteredUnits.length > 0) {
          this.workingWeight.unit = filteredUnits[0].id;
        }
      }
    });
  }
}
