import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ProgressionStrategy, ProgressionType, ParameterTypeLabel, ParameterType } from '../plan-progression-strategy';
import { MechanicsLabel, SectionLabel, ForceLabel, ModalityLabel } from '../exercise';
import { Unit, MeasurementType } from '../unit';
import { v4 as uuid } from 'uuid';
import { UnitsService } from '../units.service';

@Component({
  selector: 'app-plan-progression-strategy',
  templateUrl: './plan-progression-strategy.component.html',
  styleUrls: ['./plan-progression-strategy.component.css']
})
export class PlanProgressionStrategyComponent implements OnInit, OnChanges {
  @Input() progression: ProgressionStrategy;
  @Input() triedToSave: boolean;

  units: Unit[];
  unitsFiltered: Unit[];  

  idExercise = uuid();
  idCharacteristics = uuid();
  idGroup = uuid();

  modalityLabel = ModalityLabel;
  mechanicsLabel = MechanicsLabel;
  sectionLabel = SectionLabel;
  forceLabel = ForceLabel;
  parameterTypeLabel = ParameterTypeLabel;

  constructor(
    private unitsService: UnitsService,
  ) { }

  ngOnInit() {
    this.unitsService.getUnits()
    .subscribe(u => { 
      this.units = u;
      this.unitsFiltered = u;
      this.filterUnits();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.progression) {
      this.filterUnits();
    }
  }

  clearUnusedParameters(): void {
    if (this.progression.progression_type == ProgressionType.ByExercise) {
      this.progression.mechanics = null;
      this.progression.section = null;
      this.progression.force = null;
      this.progression.modality = null;
    }

    if (this.progression.progression_type == ProgressionType.ByCharacteristics) {
      this.progression.exercise = null;
    }
  }

  filterUnits() {
    if (!this.units) {
      return;
    }

    switch (this.progression.parameter_type) {
      case ParameterType.Distance:
        this.unitsFiltered = this.units.filter(u => u.measurement_type == MeasurementType.Distance);
        break;
      case ParameterType.Time:
        this.unitsFiltered = this.units.filter(u => u.measurement_type == MeasurementType.Time);
        break;
      case ParameterType.Weight:
        this.unitsFiltered = this.units.filter(u => u.measurement_type == MeasurementType.Weight);
        break;
      case ParameterType.Speed:
        this.unitsFiltered = this.units.filter(u => u.measurement_type == MeasurementType.Speed);
        break;
      default:
        this.unitsFiltered = this.units;
        break;
    }

    if (this.unitsFiltered.filter(u => u.id == this.progression.unit).length == 0) {
      this.progression.unit = null;
    }
  }
}
