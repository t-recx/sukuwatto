import { Component, OnInit, Input } from '@angular/core';
import { ProgressionStrategy } from '../plan-progression-strategy';
import { faTimesCircle, faChartLine } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-plan-progression-strategies',
  templateUrl: './plan-progression-strategies.component.html',
  styleUrls: ['./plan-progression-strategies.component.css']
})
export class PlanProgressionStrategiesComponent implements OnInit {
  @Input() progressions: ProgressionStrategy[];
  @Input() triedToSave: boolean;
  @Input() type_label: string;

  faTimesCircle = faTimesCircle;
  faChartLine = faChartLine;

  constructor(
  ) { }

  ngOnInit() {
  }

  removeProgression(progression) {
    const index = this.progressions.indexOf(progression, 0);
    if (index > -1) {
      this.progressions.splice(index, 1);
    }
  }

  newProgression() {
    let newProgression = new ProgressionStrategy();

    this.progressions.push(newProgression);
  }
}
