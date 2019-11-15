import { Component, OnInit, Input } from '@angular/core';
import { ProgressionStrategy, ProgressionType } from '../plan-progression-strategy';
import { Exercise, MechanicsLabel, SectionLabel, ForceLabel, ModalityLabel } from '../exercise';
import { Unit } from '../unit';

@Component({
  selector: 'app-plan-progression-strategy',
  templateUrl: './plan-progression-strategy.component.html',
  styleUrls: ['./plan-progression-strategy.component.css']
})
export class PlanProgressionStrategyComponent implements OnInit {
  @Input() progression: ProgressionStrategy;
  @Input() exercises: Exercise[];
  @Input() units: Unit[];
  @Input() triedToSave: boolean;

  modalityLabel = ModalityLabel;
  mechanicsLabel = MechanicsLabel;
  sectionLabel = SectionLabel;
  forceLabel = ForceLabel;

  constructor() { }

  ngOnInit() {
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
