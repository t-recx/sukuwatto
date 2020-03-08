import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { ProgressionStrategy, ProgressionType } from '../plan-progression-strategy';
import { Exercise, MechanicsLabel, SectionLabel, ForceLabel, ModalityLabel } from '../exercise';
import { Unit, MeasurementType } from '../unit';
import { v4 as uuid } from 'uuid';
import { PlansService } from '../plans.service';
import { UnitsService } from '../units.service';

@Component({
  selector: 'app-plan-progression-strategy',
  templateUrl: './plan-progression-strategy.component.html',
  styleUrls: ['./plan-progression-strategy.component.css']
})
export class PlanProgressionStrategyComponent implements OnInit {
  @Input() progression: ProgressionStrategy;
  @Input() triedToSave: boolean;

  units: Unit[];

  idExercise = uuid();
  idCharacteristics = uuid();
  idGroup = uuid();

  modalityLabel = ModalityLabel;
  mechanicsLabel = MechanicsLabel;
  sectionLabel = SectionLabel;
  forceLabel = ForceLabel;

  constructor(
    private unitsService: UnitsService,
  ) { }

  ngOnInit() {
    this.unitsService.getUnits().subscribe(u => this.units = u.filter(x => x.measurement_type == MeasurementType.Weight));
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
}
