import { Component, OnInit, Input } from '@angular/core';
import { PlanSessionGroupActivity, RepetitionTypeLabel, RepetitionType } from '../plan-session-group-activity';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-plan-session-group-activity',
  templateUrl: './plan-session-group-activity.component.html',
  styleUrls: ['./plan-session-group-activity.component.css']
})
export class PlanSessionGroupExerciseComponent implements OnInit {
  @Input() planSessionGroupExercise: PlanSessionGroupActivity;
  @Input() exercises: Exercise[];
  @Input() triedToSave: boolean;

  repetitionTypeEnum = RepetitionType;
  repetitionTypeLabel = RepetitionTypeLabel;

  constructor() { }

  ngOnInit() {
  }

  repetitionTypeChange() {
    if (this.planSessionGroupExercise.repetition_type != RepetitionType.Range) {
      this.planSessionGroupExercise.number_of_repetitions_up_to = null;
    }

    if (this.planSessionGroupExercise.repetition_type != RepetitionType.Range &&
      this.planSessionGroupExercise.repetition_type != RepetitionType.Standard) {
      this.planSessionGroupExercise.number_of_repetitions = null;
      this.planSessionGroupExercise.number_of_repetitions_up_to = null;
    }
  }
}
