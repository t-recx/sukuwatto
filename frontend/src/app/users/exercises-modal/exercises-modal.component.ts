import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Exercise } from '../exercise';
import { faDumbbell, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-exercises-modal',
  templateUrl: './exercises-modal.component.html',
  styleUrls: ['./exercises-modal.component.css']
})
export class ExercisesModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() exerciseType: string = null;
  @Output() selected = new EventEmitter<Exercise>();
  @Output() closed = new EventEmitter();

  newExerciseModalVisible: boolean = false;

  faDumbbell = faDumbbell;
  faTimes = faTimes;

  page: number;

  constructor() { }

  ngOnInit() {
    this.page = 1;
  }

  select(exercise): void {
    this.selected.emit(exercise);
  }

  newExercise(): void {
    this.newExerciseModalVisible = true;
  }

  hideNewExerciseModal(): void {
    this.newExerciseModalVisible = false;
  }

  close(): void {
    this.closed.emit();
  }
}
