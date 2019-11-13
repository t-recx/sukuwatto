import { Component, OnInit, Input } from '@angular/core';
import { ProgressionStrategy } from '../plan-progression-strategy';
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
}
