import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-exercises-modal',
  templateUrl: './exercises-modal.component.html',
  styleUrls: ['./exercises-modal.component.css']
})
export class ExercisesModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() selected = new EventEmitter<Exercise>();
  @Output() closed = new EventEmitter();

  newExerciseModalVisible: boolean = false;

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
