import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WorkingParameter } from '../working-parameter';
import { Exercise, ExerciseType } from '../exercise';
import { Unit, MeasurementType } from '../unit';
import { AuthService } from 'src/app/auth.service';
import { UnitsService } from '../units.service';
import { ParameterTypeLabel, ParameterType } from '../plan-progression-strategy';
@Component({
  selector: 'app-working-parameter',
  templateUrl: './working-parameter.component.html',
  styleUrls: ['./working-parameter.component.css']
})
export class WorkingParameterComponent implements OnInit, OnChanges {
  @Input() workingParameter: WorkingParameter;
  @Input() triedToSave: boolean;
  @Input() triedToHide: boolean;

  units: Unit[];
  filteredUnits: Unit[];

  parameterTypeLabel = ParameterTypeLabel;

  constructor(
    unitsService: UnitsService,
    private authService: AuthService) {
    unitsService.getUnits().subscribe(u => {
      this.units = u.filter(x => 
          x.measurement_type == MeasurementType.Weight ||
          x.measurement_type == MeasurementType.Speed ||
          x.measurement_type == MeasurementType.Distance ||
          x.measurement_type == MeasurementType.Time);
      this.filteredUnits = this.units;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.workingParameter) {
      this.filterUnits();
    }
  }

  ngOnInit() {
  }

  onWeightChange(event) {
    this.workingParameter.manually_changed = true;
  }

  filterUnits() {
    if (!this.units) {
      return;
    }

    if (!this.workingParameter || !this.workingParameter.parameter_type) {
      this.filteredUnits = this.units;
      return;
    }

    let defaultUnit;

    switch (this.workingParameter.parameter_type) {
      case ParameterType.Distance:
        this.filteredUnits = this.units.filter(x => x.measurement_type == MeasurementType.Distance);
        defaultUnit = this.filteredUnits.filter(x => x.id == +this.authService.getUserDistanceUnitId())[0];
        break;
      case ParameterType.Weight:
        this.filteredUnits = this.units.filter(x => x.measurement_type == MeasurementType.Weight);
        defaultUnit = this.filteredUnits.filter(x => x.id == +this.authService.getUserWeightUnitId())[0];
        break;
      case ParameterType.Speed:
        this.filteredUnits = this.units.filter(x => x.measurement_type == MeasurementType.Speed);
        defaultUnit = this.filteredUnits.filter(x => x.id == +this.authService.getUserSpeedUnitId())[0];
        break;
      case ParameterType.Time:
        this.filteredUnits = this.units.filter(x => x.measurement_type == MeasurementType.Time);
        defaultUnit = this.filteredUnits.filter(x => x.abbreviation == 'min')[0];
        break;
    }

    if (!this.workingParameter.unit) {
      if (this.filteredUnits.filter(x => x.id == this.workingParameter.unit).length == 0) {
        this.workingParameter.unit = defaultUnit.id;
      }
    }
    else {
      if (this.filteredUnits.filter(x => x.id == this.workingParameter.unit).length == 0) {
        this.workingParameter.unit = null;
      }
    }
  }
}
