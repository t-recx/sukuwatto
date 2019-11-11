import { Component, OnInit, Input } from '@angular/core';
import { PlanProgressionStrategy } from '../plan-progression-strategy';
import { Exercise } from '../exercise';
import { Unit } from '../unit';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-plan-progression-strategies',
  templateUrl: './plan-progression-strategies.component.html',
  styleUrls: ['./plan-progression-strategies.component.css']
})
export class PlanProgressionStrategiesComponent implements OnInit {
  @Input() progressions: PlanProgressionStrategy[];
  @Input() exercises: Exercise[];
  @Input() units: Unit[];
  @Input() triedToSave: boolean;

  faTimesCircle = faTimesCircle;

  constructor() { }

  ngOnInit() {
  }

  removeProgression(progression) {
    const index = this.progressions.indexOf(progression, 0);
    if (index > -1) {
      this.progressions.splice(index, 1);
    }
  }

  newProgression() {
    let newProgression = new PlanProgressionStrategy();

    this.progressions.push(newProgression);
  }
}
